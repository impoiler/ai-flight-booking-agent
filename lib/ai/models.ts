// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: "gpt-4o-mini",
    label: "GPT 4o mini",
    apiIdentifier: "gpt-4o-mini",
    description: "Small model for fast, lightweight tasks",
  },
  {
    id: "gpt-4o",
    label: "GPT 4o",
    apiIdentifier: "gpt-4o",
    description: "For complex, multi-step tasks",
  },
  {
    id: "claude-3-5-sonnet-20241022",
    label: "Claude 3.5 Sonnet (New)",
    apiIdentifier: "claude-3-5-sonnet-20241022",
    description: "Latest Claude 3.5 Sonnet model, released October 2024",
  },
  {
    id: "claude-3-5-haiku-20241022",
    label: "Claude 3.5 Haiku",
    apiIdentifier: "claude-3-5-haiku-20241022",
    description: "Lightweight Claude 3.5 model for faster processing",
  },
  {
    id: "claude-3-5-sonnet-20240620",
    label: "Claude 3.5 Sonnet (Old)",
    apiIdentifier: "claude-3-5-sonnet-20240620",
    description: "Previous version of Claude 3.5 Sonnet, released June 2024",
  },
  {
    id: "claude-3-haiku-20240307",
    label: "Claude 3 Haiku",
    apiIdentifier: "claude-3-haiku-20240307",
    description: "Efficient Claude 3 model for quick responses",
  },
  {
    id: "claude-3-opus-20240229",
    label: "Claude 3 Opus",
    apiIdentifier: "claude-3-opus-20240229",
    description: "Most powerful Claude 3 model for complex tasks",
  },
  {
    id: "claude-3-sonnet-20240229",
    label: "Claude 3 Sonnet",
    apiIdentifier: "claude-3-sonnet-20240229",
    description: "Balanced Claude 3 model for general use",
  },
  {
    id: "grok-2-vision-1212",
    label: "Grok 2 Vision 1212",
    apiIdentifier: "grok-2-vision-1212",
    description:
      "Vision-enabled model with 8K context window, supports both text and image I/O",
  },
  {
    id: "grok-2-1212",
    label: "Grok 2 1212",
    apiIdentifier: "grok-2-1212",
    description: "Text-only model with large 128K context window",
  },
  {
    id: "grok-beta",
    label: "Grok Beta",
    apiIdentifier: "grok-beta",
    description: "Beta text model with large 128K context window",
  },
] as const;

export const DEFAULT_MODEL_NAME: string = "gpt-4o-mini";
