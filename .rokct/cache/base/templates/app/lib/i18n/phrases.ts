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

// Phrase translation for landing copy (base_sdk 1.66.0). Ray, 2026-11-21:
// "translate all texts in all our websites". Landing pages are written as
// English sentences, so instead of a key per sentence each SDK ships a
// phrase book in its copy file: app/lib/i18n/sdk/<sdk>.json carries
// "af": { "__phrases": { "<English>": "<Afrikaans>" } }. tx(value) swaps a
// string for its Afrikaans when the visitor picked AF, and returns
// anything else (numbers, elements, untranslated text) unchanged, so it is
// safe to wrap any child. The books of every installed SDK merge here.

import { currentLocale } from "@/app/lib/i18n";
import { sdkTranslations } from "@/app/lib/i18n/sdk-registry";

const book: Record<string, string> = {};
for (const bundle of sdkTranslations) {
  const phrases = bundle?.af?.__phrases;
  if (phrases && typeof phrases === "object") Object.assign(book, phrases);
}

function norm(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** The Afrikaans of an English phrase when the visitor reads AF. */
export function tx<T>(value: T): T {
  if (typeof value !== "string" || currentLocale() !== "af") return value;
  const key = norm(value);
  const hit = book[key];
  if (!hit) return value;
  const lead = value.match(/^\s*/)?.[0] ?? "";
  const trail = value.match(/\s*$/)?.[0] ?? "";
  return (lead + hit + trail) as unknown as T;
}

export default tx;
