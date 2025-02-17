import { Maxim } from "@maximai/maxim-js";

export const maxim = new Maxim({
    baseUrl: process.env.LOGGING_BASE_URL!,
    apiKey: process.env.MAXIM_API_KEY!,
});
