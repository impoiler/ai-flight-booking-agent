import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai";
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";

import { customMiddleware } from "./custom-middleware";

export const customModel = (
  apiIdentifier: string,
  provider: "anthropic" | "openai" | "x" = "openai"
) => {
  let model =
    provider === "anthropic"
      ? anthropic(apiIdentifier)
      : provider === "x"
      ? xai(apiIdentifier)
      : openai(apiIdentifier);

  return wrapLanguageModel({
    model,
    middleware: customMiddleware,
  });
};
