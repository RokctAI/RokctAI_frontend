import { google } from "@ai-sdk/google";
import { wrapLanguageModel } from "ai";
import { AI_MODELS } from "@/ai/models";

import { customMiddleware } from "./custom-middleware";

const models = {
  [AI_MODELS.PAID.id]: wrapLanguageModel({
    model: google(AI_MODELS.PAID.id, {
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY_PAID,
    }),
    middleware: customMiddleware,
  }),
  [AI_MODELS.FREE.id]: wrapLanguageModel({
    model: google(AI_MODELS.FREE.id, {
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    }),
    middleware: customMiddleware,
  }),
};

export const getModel = (id: string) => {
  return models[id] || models[AI_MODELS.FREE.id];
};

export const geminiFlashModel = models[AI_MODELS.FREE.id];
export const geminiProPaidModel = models[AI_MODELS.PAID.id];
