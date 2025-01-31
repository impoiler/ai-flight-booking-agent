import { openai } from "@/lib/ai/openai";
import { Index } from "@upstash/vector";

// Initialize Upstash Vector client
const vectorStore = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  cache: "force-cache",
});

export interface Document {
  id: string;
  content: string;
  metadata?: {
    content?: string;
    toolName?: string;
  };
}

export async function upsertDocuments(
  documents: Document[],
  conversationId: string
) {
  const embeddings = await Promise.all(
    documents.map(async (doc) => {
      const response = await openai.embeddings.create({
        input: doc.content,
        model: "text-embedding-ada-002", // or your Azure OpenAI embedding model
      });
      return {
        id: doc.id,
        vector: response.data[0].embedding,
        metadata: doc.metadata,
      };
    })
  );

  await vectorStore.upsert(embeddings, {
    namespace: conversationId,
  });
}

export async function queryDocuments(
  query: string,
  limit: number = 5,
  conversationId: string
) {
  const response = await openai.embeddings.create({
    input: query,
    model: "text-embedding-ada-002", // or your Azure OpenAI embedding model
  });
  const queryVector = response.data[0].embedding;

  const results = await vectorStore.query(
    {
      vector: queryVector,
      topK: limit,
      includeMetadata: true,
    },
    {
      namespace: conversationId,
    }
  );

  return results;
}

export async function deleteDocument(id: string) {
  await vectorStore.delete([id]);
}

export async function reset() {
  await vectorStore.reset();
}
