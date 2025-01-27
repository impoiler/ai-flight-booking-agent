import OpenAI, { AzureOpenAI } from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const azureOpenAI = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: "2024-09-01-preview",
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME as string,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
});
