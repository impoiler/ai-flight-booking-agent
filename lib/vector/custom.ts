import { dot } from "mathjs";
import { azureOpenAI } from "../ai/openai";

// Types for embedding operations
type Embedding = number[];

type TextChunk = {
  text: string;
  embedding?: Embedding;
};

type RAGQueryResult = {
  query: string;
  relevantInfo: string;
};

// Function to chunk text into smaller pieces
function chunkText(text: string, maxChunkSize: number = 2000): string[] {
  // Convert JSON to string if needed
  const stringText = typeof text === "object" ? JSON.stringify(text) : text;

  // Split into sentences (simple implementation)
  const sentences = stringText.match(/[^.!?]+[.!?]+/g) || [stringText];

  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxChunkSize) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

// Function to get embeddings for a text
async function getEmbedding(text: string): Promise<Embedding> {
  const response = await azureOpenAI.embeddings.create({
    model: "text-embedding-3-large",
    input: text,
    dimensions: 3072, // Using full dimensions for better accuracy
  });

  return response.data[0].embedding;
}

// Function to calculate cosine similarity between two embeddings
function cosineSimilarity(
  embedding1: Embedding,
  embedding2: Embedding
): number {
  const dotProduct = dot(embedding1, embedding2);
  const norm1 = Math.sqrt(dot(embedding1, embedding1));
  const norm2 = Math.sqrt(dot(embedding2, embedding2));
  return dotProduct / (norm1 * norm2);
}

// Function to process chunks and find relevant information
async function processChunksWithSimilarity(
  chunks: TextChunk[],
  queryEmbedding: Embedding,
  similarityThreshold: number = 0.8
): Promise<string[]> {
  const relevantChunks: string[] = [];

  for (const chunk of chunks) {
    // Get embedding for chunk if not already present
    if (!chunk.embedding) {
      chunk.embedding = await getEmbedding(chunk.text);
    }

    // Calculate similarity
    const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);

    // Add chunk if similarity is above threshold
    if (similarity >= similarityThreshold) {
      relevantChunks.push(chunk.text);
    }
  }

  return relevantChunks;
}

// Function to generate RAG query from tool input and output
async function generateRAGQuery(
  toolName: string,
  toolInput: any,
  toolOutput: any,
  modelId: string
): Promise<string> {
  const prompt = `Given a tool call to "${toolName}" with input: ${JSON.stringify(
    toolInput
  )}
  Generate a specific search query that would help extract the most relevant information from the tool's output.
  Focus on what would be most useful for the user in this context.
  Return only the search query, nothing else.`;

  const response = await azureOpenAI.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 100,
    model: modelId,
  });

  return response.choices[0].message.content ?? "";
}

async function processWithRAG(
  toolName: string,
  toolInput: any,
  toolOutput: any,
  modelId: string
): Promise<RAGQueryResult> {
  // Generate RAG query
  const query = await generateRAGQuery(
    toolName,
    toolInput,
    toolOutput,
    modelId
  );

  try {
    // Step 1: Chunk the tool output
    const chunks = chunkText(toolOutput).map((text) => ({ text }));

    // Step 2: Get embedding for the query
    const queryEmbedding = await getEmbedding(query);

    // Step 3: Find relevant chunks using similarity search
    const relevantChunks = await processChunksWithSimilarity(
      chunks,
      queryEmbedding
    );

    // Step 4: If no relevant chunks found, return a message
    if (relevantChunks.length === 0) {
      return {
        query,
        relevantInfo: "No relevant information found in the tool output.",
      };
    }

    // Step 5: Generate final summary from relevant chunks
    const summaryPrompt = `Given the search query: "${query}"
And these relevant pieces of information:
${relevantChunks.join("\n")}

Please provide a clear, structured summary that answers the query using only the information provided above.`;

    const response = await azureOpenAI.chat.completions.create({
      messages: [
        {
          role: "user",
          content: summaryPrompt,
        },
      ],
      max_tokens: 500,
      model: modelId,
    });

    return {
      query,
      relevantInfo: response.choices[0].message.content ?? "",
    };
  } catch (error) {
    console.error("Error in RAG processing:", error);

    // Fallback to direct processing if RAG fails
    const fallbackPrompt = `Given the following tool output: ${JSON.stringify(
      toolOutput
    )}
And the search query: "${query}"
Extract and summarize the most relevant information that answers this query.`;

    const fallbackResponse = await azureOpenAI.chat.completions.create({
      messages: [
        {
          role: "user",
          content: fallbackPrompt,
        },
      ],
      max_tokens: 500,
      model: modelId,
    });

    return {
      query,
      relevantInfo: `(Fallback Processing) ${
        fallbackResponse.choices[0].message.content ?? ""
      }`,
    };
  }
}

export { chunkText, cosineSimilarity, getEmbedding, processWithRAG };
export type { Embedding, RAGQueryResult, TextChunk };

