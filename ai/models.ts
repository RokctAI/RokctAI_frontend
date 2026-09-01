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

export const AI_MODELS = {
  PAID: {
    id: "gemini-3-pro",
    label: "Pro",
    description: "Reasoning & Depth",
  },
  FREE: {
    id: "gemini-2.5-flash",
    label: "Flash",
    description: "Fast & Efficient",
  },
} as const;

export type ModelId = (typeof AI_MODELS)[keyof typeof AI_MODELS]["id"];
