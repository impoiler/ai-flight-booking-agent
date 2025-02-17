"use client";

import type { ChatRequestOptions, Message } from "ai";
import cx from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useState } from "react";

import type { Vote } from "@/lib/db/schema";

import { cn, generateUUID } from "@/lib/utils";
import equal from "fast-deep-equal";
import { BookingDotComAirportList } from "./booking-cards/airport-suggestions";
import FlightBookingConfirmation from "./booking-cards/booking-confirmation";
import { BookingDotComFlightDetails } from "./booking-cards/flight-details";
import { BookingDotComFlightsList } from "./booking-cards/flights-list";
import { PencilEditIcon, SparklesIcon } from "./icons";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { MessageEditor } from "./message-editor";
import { PreviewAttachment } from "./preview-attachment";
import ToolCallLoading from "./tool-call-loading";
import { Button } from "./ui/button";
import { Weather } from "./weather";

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            }
          )}
        >
          {message.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 w-full">
            {message.experimental_attachments && (
              <div className="flex flex-row justify-end gap-2">
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {message.content && mode === "view" && (
              <div className="flex flex-row gap-2 items-start">
                {message.role === "user" && !isReadonly && (
                  <Button
                    variant="ghost"
                    className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                    onClick={() => {
                      setMode("edit");
                    }}
                  >
                    <PencilEditIcon />
                  </Button>
                )}

                <div
                  className={cn("flex flex-col gap-4", {
                    "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
                      message.role === "user",
                  })}
                >
                  <Markdown>{message.content as string}</Markdown>
                </div>
              </div>
            )}

            {message.content && mode === "edit" && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <MessageEditor
                  key={message.id}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
                />
              </div>
            )}

            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <div className="flex flex-col gap-4">
                {message.toolInvocations.map((toolInvocation) => {
                  const { toolName, toolCallId, state, args } = toolInvocation;

                  switch (state) {
                    case "result":
                      const { result } = toolInvocation;
                      return (
                        <div key={toolCallId}>
                          {(() => {
                            switch (toolName) {
                              case "getWeather":
                                return <Weather weatherAtLocation={result} />;
                              case "searchAirports":
                                return (
                                  <BookingDotComAirportList
                                    airports={result}
                                    onChange={(airportId) => {
                                      setMessages((prevMessages) => {
                                        const newMessages = [...prevMessages];
                                        newMessages.push({
                                          content: `I will select ${airportId} airport.`,
                                          id: generateUUID(),
                                          role: "user",
                                        });
                                        return newMessages;
                                      });
                                      reload();
                                    }}
                                  />
                                );
                              case "searchFlights":
                                return (
                                  <BookingDotComFlightsList
                                    result={result}
                                    onChange={(flight) => {
                                      setMessages((prevMessages) => {
                                        const newMessages = [...prevMessages];
                                        newMessages.push({
                                          content: `I think I will select ${flight}. show me the details.`,
                                          id: generateUUID(),
                                          role: "user",
                                        });
                                        return newMessages;
                                      });
                                      reload();
                                    }}
                                  />
                                );
                              case "getFlightDetails":
                                return (
                                  <BookingDotComFlightDetails result={result} />
                                );
                              case "confirmBooking":
                                return (
                                  <FlightBookingConfirmation result={result} />
                                );
                              default:
                                return (
                                  <pre>{JSON.stringify(result, null, 2)}</pre>
                                );
                            }
                          })()}
                        </div>
                      );
                    default:
                      return (
                        <div key={toolCallId}>
                          {toolName === "searchAirports" ? (
                            <ToolCallLoading message="✈️  Getting airport suggestions" />
                          ) : toolName === "searchFlights" ? (
                            <ToolCallLoading message="🔎 Searching flights" />
                          ) : toolName === "getFlightDetails" ? (
                            <ToolCallLoading message="📋 Getting flight details" />
                          ) : toolName === "confirmBooking" ? (
                            <ToolCallLoading message="✅ Confirming booking" />
                          ) : null}
                        </div>
                      );
                  }
                })}
              </div>
            )}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations
      )
    )
      return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  }
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
