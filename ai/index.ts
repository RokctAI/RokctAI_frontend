/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
