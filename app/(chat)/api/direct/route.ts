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

import { CompletionRequest, Maxim, MaximLogger } from "@maximai/maxim-js";

export const maxDuration = 60;

type AllowedTools =
  | "searchAirports"
  | "searchFlights"
  | "getFlightDetails"
  | "confirmBooking";

const tools = [
  {
    function: {
      name: "searchAirports",
      description: "Get airport suggestions based on a search query",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query",
          },
        },
        required: ["query"],
      },
    },
    type: "function",
  },
  {
    function: {
      name: "searchFlights",
      description: "Search for flights between airports",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["ONEWAY", "ROUNDTRIP", "MULTISTOP"],
            description: "The type of trip",
          },
          adults: {
            type: "number",
            description: "Number of adults",
          },
          cabinClass: {
            type: "string",
            enum: ["ECONOMY", "BUSINESS", "FIRST", "PREMIUM_ECONOMY"],
            description: "Class of the cabin",
          },
          children: {
            type: "number",
            description: "Number of children",
          },
          from: {
            type: "string",
            description: "Departure airport",
          },
          to: {
            type: "string",
            description: "Destination airport",
          },
          fromCountry: {
            type: "string",
            description: "Country of departure",
          },
          toCountry: {
            type: "string",
            description: "Country of destination",
          },
          depart: {
            type: "string",
            description: "Departure date",
          },
          return: {
            type: "string",
            description: "Return date",
            optional: true,
          },
          sort: {
            type: "string",
            enum: ["CHEAPEST", "FASTEST", "BEST"],
            description: "Sorting preference",
          },
          enableVI: {
            type: "number",
            description: "Enable VI",
          },
          stops: {
            type: "number",
            description: "Number of stops",
            optional: true,
          },
          depTimeInt: {
            type: "string",
            description: "Departure time interval",
            optional: true,
          },
          arrTimeInt: {
            type: "string",
            description: "Arrival time interval",
            optional: true,
          },
          duration: {
            type: "number",
            description: "Flight duration",
            optional: true,
          },
          page: {
            type: "number",
            description: "Page number",
            optional: true,
          },
          limit: {
            type: "number",
            description: "Limit results per page",
            optional: true,
            default: 10,
          },
        },
        required: [
          "type",
          "adults",
          "cabinClass",
          "children",
          "from",
          "to",
          "fromCountry",
          "toCountry",
          "depart",
          "sort",
          "enableVI",
        ],
      },
    },
    type: "function",
  },
  {
    function: {
      name: "getFlightDetails",
      description: "Get detailed information about a specific flight",
      parameters: {
        type: "object",
        properties: {
          flightId: {
            type: "string",
            description: "Unique ID of the flight",
          },
          excludedAncillaries: {
            type: "string",
            description: "Ancillaries to exclude",
          },
          priceInSearch: {
            type: "string",
            description: "Price details from search",
          },
        },
        required: ["flightId", "excludedAncillaries", "priceInSearch"],
      },
    },
    type: "function",
  },
  {
    function: {
      name: "confirmBooking",
      description: "Confirm a flight booking with passenger details",
      parameters: {
        type: "object",
        properties: {
          flightNumber: {
            type: "string",
            description: "Flight number",
          },
          flightId: {
            type: "string",
            description: "Unique ID of the flight",
          },
          passengerName: {
            type: "string",
            description: "Passenger's full name",
          },
          passengerEmail: {
            type: "string",
            description: "Passenger's email address",
          },
          passengerPhone: {
            type: "string",
            description: "Passenger's phone number",
          },
        },
        required: [
          "flightNumber",
          "flightId",
          "passengerName",
          "passengerEmail",
          "passengerPhone",
        ],
      },
    },
    type: "function",
  },
];

type CustomMessage = {
  role: string;
  content: string;
  toolInvocations?: Array<ToolInvocation>;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ChatCompletionMessageToolCall[];
};

interface ToolResult<T = any> {
  name: AllowedTools;
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

  const logger = await maxim.logger({
    id: process.env.MAXIM_REPO_ID!,
  });

  if (!logger) {
    console.log("Failed to init Maxim logger");
  }

  // create session
  const session = logger?.session({
    id: conversationId,
  });

  const traceId = generateUUID();

  logger?.trace({
    id: traceId,
    sessionId: session?.id,
    name: "Flight Search",
  });


  const spanId = generateUUID();

  if (logger) {
    logger.traceSpan(traceId, {
      id: spanId,
    });
  }

  const userMessage = getMostRecentUserMessageCustom(messages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  if (logger) {
    logger.traceInput(traceId, userMessage.content)
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
      const conversation = (cache as unknown as { messages: Message[] })?.messages ?? [];

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
      logger.spanGeneration(spanId, {
        id: generationId,
        model: modelId,
        provider: "openai",
        messages: finalMessages as CompletionRequest[],
        modelParameters: {
          maxTokens: 5000
        }
      })
    }

    let result = await azureOpenAI.chat.completions.create({
      messages: finalMessages as unknown as ChatCompletionMessageParam[],
      max_tokens: 5000,
      model: modelId,
      tools: tools as any,
    });

    if (logger) {
      logger.generationResult(generationId, result as any);
    }

    if (result.choices[0].finish_reason === "tool_calls") {
      await toolCallChain(result, finalMessages, modelId, logger, spanId);

    if (result.usage) {
      tokens.completion_tokens = result.usage.completion_tokens;
      tokens.prompt_tokens = result.usage.prompt_tokens;
      tokens.total_tokens = result.usage.total_tokens;
    }

    if (result.choices[0].finish_reason === "tool_calls") {
      await toolCallChain(result, finalMessages, modelId, tokens);
    } else {
      finalMessages.push({
        role: "assistant",
        content: result.choices[0].message.content as string,
      });
    }

    if (logger) {
      logger.traceOutput(traceId, result.choices[0].message.content as string)
    }

    await redis.set(
      conversationId,
      JSON.stringify({ messages: finalMessages, tokens })
    );

    await logger?.cleanup();

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
      const toolName = tool.function.name as AllowedTools;

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
        name: tool.function.name as AllowedTools,
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
  spanId: string
  tokens: Tokens
) {
  const toolCalls = result.choices[0].message["tool_calls"];

  if (logger) {
    toolCalls?.map(toolCall => {
      logger.spanToolCall(spanId, {
        id: toolCall.id,
        name: toolCall.function.name,
        description: toolCall.function.name,
        args: toolCall.function.arguments
      })
    })
  }

  const toolCallResults = await executeTools(toolCalls);

  toolCallResults.map(toolCallResult => {
    if (!logger) return;

    if (toolCallResult.result.error) {
      logger.toolCallError(toolCallResult.id, toolCallResult.result.error)
    } else {
      logger.toolCallResult(toolCallResult.id, JSON.stringify(toolCallResult.result))
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
    logger.spanSpan(spanId, {
      id: nextSpanId,
    });

    logger.spanGeneration(nextSpanId, {
      id: generationId,
      model: modelId,
      provider: "openai",
      messages: messages as CompletionRequest[],
      modelParameters: {
        maxTokens: 5000
      }
    })
  }

  const response = await azureOpenAI.chat.completions.create({
    messages: messages as unknown as ChatCompletionMessageParam[],
    max_tokens: 5000,
    model: modelId,
    tools: tools as any,
  });


  if (logger) {
    logger.generationResult(generationId, response as any);
  }

 
  tokens.completion_tokens += response.usage?.completion_tokens ?? 0;
  tokens.prompt_tokens += response.usage?.prompt_tokens ?? 0;
  tokens.total_tokens += response.usage?.total_tokens ?? 0;

  if (response.choices[0].finish_reason === "tool_calls") {
    await toolCallChain(response, messages, modelId, tokens);
  } else {
    messages.push({
      role: "assistant",
      content: response.choices[0].message.content as string,
    });
  }
}