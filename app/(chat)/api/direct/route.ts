import { azureOpenAI } from "@/lib/ai/openai";
import { flightSearchPrompt } from "@/lib/ai/prompts";
import { bookingClient } from "@/lib/booking.com/mini-api";
import redis from "@/lib/redis";
import { mail } from "@/lib/resend/mail";
import { generateUUID, getMostRecentUserMessageCustom } from "@/lib/utils";
import { type Message, ToolInvocation } from "ai";
import { NextResponse } from "next/server";
import {
  ChatCompletion,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "openai/resources/index.mjs";

import {
  AllowedFlightSearchTools,
  flightSearchMiniTools,
} from "@/constant/tools";
import { CompletionRequest, Maxim, MaximLogger } from "@maximai/maxim-js";

export const maxDuration = 60;

type CustomMessage = {
  role: string;
  content: string;
  toolInvocations?: Array<ToolInvocation>;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ChatCompletionMessageToolCall[];
};

interface ToolResult<T = any> {
  name: AllowedFlightSearchTools;
  result: T;
  args: any;
  id: string;
}

type Tokens = {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
};

export async function POST(request: Request) {
  const token = request.headers.get("x-maxim-token");

  if (!token || token !== process.env.MAXIM_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let {
    id,
    messages,
    modelId,
  }: {
    id: string;
    messages: Array<Message>;
    modelId: string;
  } = await request.json();

  const conversationId = id ?? generateUUID();

  const maxim = new Maxim({
    baseUrl: process.env.LOGGING_BASE_URL!,
    apiKey: process.env.MAXIM_API_KEY!,
  });

  console.log("[Debug] Initializing Maxim logger...");
  const logger = await maxim.logger({
    id: process.env.MAXIM_REPO_ID!,
  });

  if (!logger) {
    console.log("[Debug] Failed to init Maxim logger");
  } else {
    console.log("[Debug] Maxim logger initialized successfully");
  }

  // create session
  console.log("[Debug] Creating logger session...");
  const session = logger?.session({
    id: conversationId,
    name: conversationId,
    tags: {
      env: process.env.NODE_ENV,
      conversationId,
    },
  });
  console.log("[Debug] Session created:", session?.id);

  const traceId = generateUUID();
  console.log("[Debug] Generated trace ID:", traceId);

  console.log("[Debug] Creating trace...");
  logger?.trace({
    id: traceId,
    sessionId: session?.id,
    name: "Flight Search",
    tags: {
      env: process.env.NODE_ENV,
      conversationId,
    },
  });

  const spanId = generateUUID();
  console.log("[Debug] Generated span ID:", spanId);

  if (logger) {
    console.log("[Debug] Creating trace span...");
    logger.traceSpan(traceId, {
      id: spanId,
      tags: {
        env: process.env.NODE_ENV,
        conversationId,
      },
    });
  }

  const userMessage = getMostRecentUserMessageCustom(messages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  if (logger) {
    console.log("[Debug] Logging trace input...");
    logger.traceInput(traceId, userMessage.content);
  }

  let tokens: Tokens = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0,
  };

  try {
    // Attempt to retrieve cached conversation from Redis
    const cache = await redis.get<string>(conversationId);

    if (cache) {
      // Parse the cached conversation
      const conversation =
        (cache as unknown as { messages: Message[] })?.messages ?? [];

      // Merge cached messages with current messages
      messages = [...conversation, ...messages];
    }

    const finalMessages = [
      ...messages.filter((message) => message.role !== "system"),
    ] as CustomMessage[];

    finalMessages.unshift({
      role: "system",
      content: flightSearchPrompt,
    });

    const generationId = generateUUID();

    if (logger) {
      console.log("[Debug] Logging span generation...");
      logger.spanGeneration(spanId, {
        id: generationId,
        model: modelId,
        provider: "openai",
        messages: finalMessages as CompletionRequest[],
        modelParameters: {
          maxTokens: 5000,
        },
        tags: {
          env: process.env.NODE_ENV,
          conversationId,
        },
      });
    }
    const relevantMessages = await getRelevantMessages(finalMessages, tokens);
    let result = await azureOpenAI.chat.completions.create({
      messages: relevantMessages as unknown as ChatCompletionMessageParam[],
      max_tokens: 5000,
      model: modelId,
      tools: flightSearchMiniTools,
    });

    if (logger) {
      console.log("[Debug] Logging generation result...");
      logger.generationResult(generationId, result as any);
    }

    if (result.usage) {
      tokens.completion_tokens = result.usage.completion_tokens;
      tokens.prompt_tokens = result.usage.prompt_tokens;
      tokens.total_tokens = result.usage.total_tokens;
    }

    if (result.choices[0].finish_reason === "tool_calls") {
      await toolCallChain(
        result,
        finalMessages,
        modelId,
        logger,
        spanId,
        tokens
      );
    } else {
      finalMessages.push({
        role: "assistant",
        content: result.choices[0].message.content as string,
      });
    }

    if (logger) {
      console.log("[Debug] Logging trace output...");
      logger.traceOutput(traceId, result.choices[0].message.content as string);
    }

    await redis.set(
      conversationId,
      JSON.stringify({ messages: finalMessages, tokens })
    );

    return NextResponse.json({
      messages: [finalMessages[finalMessages.length - 1]],
      conversationId: conversationId,
      tokens,
    });
  } catch (error: any) {
    console.error("Error in AI completion:", error);
    return NextResponse.json(
      {
        error: error?.error ?? error?.message ?? "Something went wrong",
      },
      { status: 500 }
    );
  } finally {
    await maxim.cleanup();
  }
}

async function executeTools(
  tools?: ChatCompletionMessageToolCall[]
): Promise<ToolResult[]> {
  if (!tools) {
    return [];
  }

  const toolPromises = tools.map(async (tool) => {
    try {
      const args = JSON.parse(tool.function.arguments);
      const toolName = tool.function.name as AllowedFlightSearchTools;

      let result: ToolResult | null = null;

      switch (toolName) {
        case "searchAirports": {
          const suggestions = await bookingClient.searchAirports(args.query);
          result = { name: toolName, result: suggestions, args, id: tool.id };
          break;
        }
        case "searchFlights": {
          const flights = await bookingClient.searchFlights(args);
          result = { name: toolName, result: flights, args, id: tool.id };
          break;
        }
        case "getFlightDetails": {
          const details = await bookingClient.getFlightDetails(args);
          result = { name: toolName, result: details, args, id: tool.id };
          break;
        }
        case "confirmBooking": {
          const {
            flightNumber,
            flightId,
            passengerName,
            passengerEmail,
            passengerPhone,
          } = args;

          await mail.sendFlightConfirmation(passengerEmail, {
            flightNumber,
            flightId,
            passengerName,
            passengerEmail,
            passengerPhone,
          });
          result = { name: toolName, result: "success", args, id: tool.id };
          break;
        }
      }

      return result;
    } catch (error) {
      console.error(`Error executing tool ${tool.function.name}:`, error);
      // Return a structured error result instead of null
      return {
        id: tool.id,
        name: tool.function.name as AllowedFlightSearchTools,
        result: {
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
        args: JSON.parse(tool.function.arguments),
      };
    }
  });

  const results = await Promise.allSettled(toolPromises);

  return results
    .filter(
      (result): result is PromiseFulfilledResult<ToolResult> =>
        result.status === "fulfilled" && result.value !== null
    )
    .map((result) => result.value);
}

async function toolCallChain(
  result: ChatCompletion,
  messages: CustomMessage[],
  modelId: string,
  logger: MaximLogger | undefined,
  spanId: string,
  tokens: Tokens
) {
  const toolCalls = result.choices[0].message["tool_calls"];

  if (logger) {
    console.log("[Debug] Logging tool calls...");
    toolCalls?.map((toolCall) => {
      logger.spanToolCall(spanId, {
        id: toolCall.id,
        name: toolCall.function.name,
        description: toolCall.function.name,
        args: toolCall.function.arguments,
      });
    });
  }

  const toolCallResults = await executeTools(toolCalls);

  toolCallResults.map((toolCallResult) => {
    if (!logger) return;

    console.log("[Debug] Logging tool call result/error...");
    if (toolCallResult.result.error) {
      logger.toolCallError(toolCallResult.id, toolCallResult.result.error);
    } else {
      logger.toolCallResult(
        toolCallResult.id,
        JSON.stringify(toolCallResult.result)
      );
    }
  });

  if (toolCallResults.length) {
    messages.push({
      role: "assistant",
      content: "",
      tool_calls: toolCalls,
    });
  }

  toolCallResults.forEach((result) => {
    messages.push({
      role: "tool",
      content: JSON.stringify(result.result),
      tool_call_id: result.id,
    });
  });

  const nextSpanId = generateUUID();
  const generationId = generateUUID();

  if (logger) {
    console.log("[Debug] Creating span span...");
    logger.spanSpan(spanId, {
      id: nextSpanId,
    });

    console.log("[Debug] Logging span generation...");
    logger.spanGeneration(nextSpanId, {
      id: generationId,
      model: modelId,
      provider: "openai",
      messages: messages as CompletionRequest[],
      modelParameters: {
        maxTokens: 5000,
      },
    });
  }

  const relevantMessages = await getRelevantMessages(messages, tokens);

  const response = await azureOpenAI.chat.completions.create({
    messages: relevantMessages as unknown as ChatCompletionMessageParam[],
    max_tokens: 5000,
    model: modelId,
    tools: flightSearchMiniTools,
  });

  if (logger) {
    console.log("[Debug] Logging generation result...");
    logger.generationResult(generationId, response as any);
  }

  tokens.completion_tokens += response.usage?.completion_tokens ?? 0;
  tokens.prompt_tokens += response.usage?.prompt_tokens ?? 0;
  tokens.total_tokens += response.usage?.total_tokens ?? 0;

  if (response.choices[0].finish_reason === "tool_calls") {
    await toolCallChain(response, messages, modelId, logger, spanId, tokens);
  } else {
    messages.push({
      role: "assistant",
      content: response.choices[0].message.content as string,
    });
  }
}

async function shouldIncludeToolCallResult(
  query: string,
  tokens: Tokens
): Promise<boolean> {
  const result = await azureOpenAI.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a flight booking assistant with access to the following tools: ${flightSearchMiniTools
          .map((tool) => tool.function.name)
          .join(", ")}.
        Analyze the user's message and determine if you need the results from previous tool calls to answer the next question.
        Respond with "YES" if you need the tool call results, or "NO" if you can answer without them.
        Consider the context and specificity of the user's query when making your decision.`,
      },
      {
        role: "user",
        content: query,
      },
    ],
    model: "gpt-4o",
  });

  tokens.completion_tokens += result.usage?.completion_tokens ?? 0;
  tokens.prompt_tokens += result.usage?.prompt_tokens ?? 0;
  tokens.total_tokens += result.usage?.total_tokens ?? 0;

  let shouldInclude = false;

  if (result.choices[0].message.content?.includes("YES")) {
    shouldInclude = true;
  }

  return shouldInclude;
}

async function getRelevantMessages(messages: CustomMessage[], tokens: Tokens) {
  const messagesCopy = [...messages];
  const shouldIncludeToolCall = await shouldIncludeToolCallResult(
    messagesCopy[messagesCopy.length - 1].content,
    tokens
  );
  // const shouldIncludeToolCall = true;

  if (shouldIncludeToolCall) {
    return messagesCopy;
  }

  return messagesCopy.map((message) => {
    if (message.role === "tool") {
      return { ...message, content: "" };
    }
    return message;
  });
}

function getMessages(messages: CustomMessage[], keep: number = 3) {
  if (messages.length < keep) return messages;

  const messagesCopy = [...messages.slice(-keep)];

  messagesCopy.unshift({
    role: "system",
    content: flightSearchPrompt,
  });

  return messagesCopy;
}
