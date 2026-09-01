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

export const INTENT_RULES = {
  greetings: ["hi", "hello", "hey", "hola", "greetings", "yo"],
  fillers: [
    "i am looking for",
    "i'm looking for",
    "im looking for",
    "find me",
    "search for",
    "can you find",
    "do you have",
    "looking for",
    "show me",
    "i want",
    "i need",
  ],
  types: {
    tenders: ["tender", "tender opportunity", "bid", "contract", "procurement"],
    grants: ["grant", "grant opportunity", "scholarship", "subsidies"],
    equity: [
      "equity",
      "investment",
      "vc",
      "venture capital",
      "angel investor",
      "seed funding",
    ],
  },
  domain_keywords: [
    "opportunity",
    "funding",
    "grant",
    "tender",
    "equity",
    "investment",
    "project",
    "contract",
    "bid",
    "scholarship",
    "money",
    "financial",
    "support",
    "venture",
    "capital",
    "fund",
    "funder",
    "fundraise",
  ],
};

export function analyzeIntent(query: string) {
  let cleaned = query.toLowerCase().trim();

  if (INTENT_RULES.greetings.some((g) => cleaned === g)) {
    return { type: "greeting", cleaned };
  }

  // Remove fillers in a loop to handle multiple or overlapping fillers
  let prevCleaned;
  do {
    prevCleaned = cleaned;
    INTENT_RULES.fillers.forEach((filler) => {
      cleaned = cleaned.replace(filler, "");
    });
    cleaned = cleaned.trim();
  } while (cleaned !== prevCleaned);

  if (!cleaned) {
    return { type: "vague", cleaned: query.toLowerCase().trim() };
  }

  // 1. Check for specific type match (only for unambiguous terms)
  for (const [type, keywords] of Object.entries(INTENT_RULES.types)) {
    if (keywords.some((kw) => cleaned.includes(kw))) {
      return { type: "type_match", opportunityType: type, cleaned };
    }
  }

  // 2. Check if it's related to the domain at all
  const isDomainRelated = INTENT_RULES.domain_keywords.some((kw) =>
    cleaned.includes(kw),
  );

  if (!isDomainRelated) {
    return { type: "unrelated", cleaned };
  }

  // If it's domain related but not a specific unambiguous type,
  // it's a general search across all types.
  return { type: "search", cleaned };
}
