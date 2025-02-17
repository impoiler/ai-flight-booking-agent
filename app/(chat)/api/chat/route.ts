import { auth } from "@/app/(auth)/auth";
import { customModel } from "@/lib/ai";
import { models } from "@/lib/ai/models";
import { systemPrompt } from "@/lib/ai/prompts";
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from "@/lib/db/queries";
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from "@/lib/utils";
import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  streamText,
} from "ai";
import { z } from "zod";

import { bookingClient } from "@/lib/booking.com/api";
import { mail } from "@/lib/resend/mail";
import { generateTitleFromUserMessage } from "../../actions";

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

const allTools: AllowedTools[] = [...flightTools];

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
  }: {
    id: string;
    messages: Array<Message>;
    modelId: string;
  } = await request.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const model = models.find((model) => model.id === modelId);
  let provider: "openai" | "anthropic" | "x" = "openai";

  if (model?.id.startsWith("gpt")) {
    provider = "openai";
  } else if (model?.id.startsWith("claude")) {
    provider = "anthropic";
  } else if (model?.id.startsWith("grok")) {
    provider = "x";
  }

  if (!model) {
    return new Response("Model not found", { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: session.user.id, title });
  }

  const userMessageId = generateUUID();

  await saveMessages({
    messages: [
      { ...userMessage, id: userMessageId, createdAt: new Date(), chatId: id },
    ],
  });

  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeData({
        type: "user-message-id",
        content: userMessageId,
      });

      const result = streamText({
        model: customModel(model.apiIdentifier, provider),
        maxTokens: 2000,
        system: systemPrompt,
        messages: coreMessages,
        maxSteps: 10,
        experimental_activeTools: allTools,
        tools: {
          searchAirports: {
            description: "Get airport suggestions based on a search query",
            parameters: z.object({
              query: z.string(),
            }),
            execute: async ({ query }) => {
              const suggestions = await bookingClient.searchAirports(query);
              return suggestions;
            },
          },
          searchFlights: {
            description: "Search for flights between airports",
            parameters: z.object({
              type: z.enum(["ONEWAY", "ROUNDTRIP", "MULTISTOP"]),
              adults: z.number(),
              cabinClass: z.enum([
                "ECONOMY",
                "BUSINESS",
                "FIRST",
                "PREMIUM_ECONOMY",
              ]),
              children: z.number(),
              from: z.string(),
              to: z.string(),
              fromCountry: z.string(),
              toCountry: z.string(),
              depart: z.string(),
              return: z.string().optional(),
              sort: z.enum(["CHEAPEST", "FASTEST", "BEST"]),
              enableVI: z.number(),
              stops: z.number().optional(),
              depTimeInt: z.string().optional(),
              arrTimeInt: z.string().optional(),
              duration: z.number().optional(),
              page: z.number().optional(),
              limit: z.number().optional().default(10),
            }),
            execute: async (params) => {
              console.log("🛠️ Executing searchFlights tool", params);

              const flights = await bookingClient.searchFlights(params);
              return flights;
            },
          },
          getFlightDetails: {
            description: "Get detailed information about a specific flight",
            parameters: z.object({
              flightId: z.string(),
              excludedAncillaries: z.string(),
              priceInSearch: z.string(),
            }),
            execute: async (params) => {
              console.log("🛠️ Executing getFlightDetails tool", params);
              const details = await bookingClient.getFlightDetails(params);
              return details;
            },
          },
          confirmBooking: {
            description: "Confirm a flight booking with passenger details",
            parameters: z.object({
              flightNumber: z.string(),
              flightId: z.string().default(generateUUID()),
              passengerName: z.string(),
              passengerEmail: z.string().email(),
              passengerPhone: z.string(),
            }),
            execute: async ({
              flightNumber,
              flightId,
              passengerName,
              passengerEmail,
              passengerPhone,
            }) => {
              console.log("🛠️ EXECUTING confirmBooking");
              await mail.sendFlightConfirmation(passengerEmail, {
                flightNumber,
                flightId,
                passengerName,
                passengerEmail,
                passengerPhone,
              });
              return {
                flightNumber,
                flightId,
                passengerName,
                passengerEmail,
                passengerPhone,
              };
            },
          },
        },
        onFinish: async ({ response }) => {
          if (session.user?.id) {
            try {
              const responseMessagesWithoutIncompleteToolCalls =
                sanitizeResponseMessages(response.messages);
              if (responseMessagesWithoutIncompleteToolCalls.length === 0) {
                return;
              }
              const messageId = generateUUID();

              await saveMessages({
                messages: responseMessagesWithoutIncompleteToolCalls.map(
                  (message) => {
                    if (message.role === "assistant") {
                      dataStream.writeMessageAnnotation({
                        messageIdFromServer: messageId,
                      });
                    }
                    return {
                      id: messageId,
                      chatId: id,
                      role: message.role,
                      content: message.content,
                      createdAt: new Date(),
                    };
                  }
                ),
              });
            } catch (error) {
              console.error("Failed to save chat");
            }
          }
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: "stream-text",
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
