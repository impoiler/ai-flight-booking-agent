import { openai } from "@/lib/ai/openai";
import { bookingClient } from "@/lib/booking.com/api";
import { mail } from "@/lib/resend/mail";
import { getMostRecentUserMessage } from "@/lib/utils";
import { type Message, ToolInvocation, convertToCoreMessages } from "ai";
import { NextResponse } from "next/server";
import {
  ChatCompletion,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "openai/resources/index.mjs";

export const maxDuration = 60;

type AllowedTools =
  | "searchAirports"
  | "searchFlights"
  | "getFlightDetails"
  | "confirmBooking";

const flightTools: AllowedTools[] = [
  "searchAirports",
  "searchFlights",
  "getFlightDetails",
  "confirmBooking",
];

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
            enum: ["ONEWAY", "ROUND"],
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
};

export async function POST(request: Request) {
  const token = request.headers.get("x-maxim-token");

  if (!token || token !== process.env.MAXIM_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    id,
    messages,
    modelId,
  }: {
    id: string;
    messages: Array<Message>;
    modelId: string;
  } = await request.json();

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  try {
    let finalMessages = [] as CustomMessage[];

    for (const message of coreMessages) {
      if (message.role === "user") {
        finalMessages.push({
          role: "user",
          content: message.content as string,
        });
      } else {
        finalMessages.push({
          role: "assistant",
          content: message.content as string,
        });
      }
    }

    let result = await openai.chat.completions.create({
      messages: finalMessages as unknown as ChatCompletionMessageParam[],
      max_tokens: 2000,
      model: modelId,
      tools: tools as any,
    });

    if (result.choices[0].finish_reason === "tool_calls") {
      await toolCallChain(result, finalMessages, modelId);
    } else {
      finalMessages.push({
        role: "assistant",
        content: result.choices[0].message.content as string,
      });
    }

    return NextResponse.json({
      messages: finalMessages.map((message) => {
        if (message.toolInvocations) {
          return {
            ...message,
            content: null,
          };
        }

        return message;
      }),
    });
  } catch (error) {
    console.error("Error in AI completion:", error);
    return new Response("Error processing request", { status: 500 });
  }
}

async function executeTools(tools?: ChatCompletionMessageToolCall[]) {
  if (!tools) {
    return [];
  }

  const toolPromises = tools.map(async (tool) => {
    const args = JSON.parse(tool.function.arguments);
    const toolName = tool.function.name as AllowedTools;
    switch (toolName) {
      case "searchAirports":
        const suggestions = await bookingClient.searchAirports(args.query);
        return { name: toolName, result: suggestions, args };
      case "searchFlights":
        const flights = await bookingClient.searchFlights(args);
        return { name: toolName, result: flights, args };
      case "getFlightDetails":
        const details = await bookingClient.getFlightDetails(args);
        return { name: toolName, result: details, args };
      case "confirmBooking":
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
        return { name: toolName, result: "success", args };
      default:
        return null;
    }
  });

  const results = await Promise.all(toolPromises);
  return results.filter(
    (result): result is { name: AllowedTools; result: any; args: any } =>
      result !== null
  );
}

async function toolCallChain(
  result: ChatCompletion,
  messages: CustomMessage[],
  modelId: string
) {
  const toolCallResults = await executeTools(
    result.choices[0].message["tool_calls"]
  );

  messages.push({
    role: "assistant",
    content: `There was a tool call and tool call result is - ${JSON.stringify(
      toolCallResults
    )}`,
    toolInvocations: toolCallResults.map((result) => ({
      name: result.name,
      args: result.args,
      result: result.result,
      state: "result",
      toolName: result.name,
      toolCallId: result.name,
    })),
  });

  const response = await openai.chat.completions.create({
    messages: messages as unknown as ChatCompletionMessageParam[],
    max_tokens: 5000,
    model: modelId,
    tools: tools as any,
  });

  if (response.choices[0].finish_reason === "tool_calls") {
    await toolCallChain(response, messages, modelId);
  } else {
    messages.push({
      role: "assistant",
      content: response.choices[0].message.content as string,
    });
  }
}
