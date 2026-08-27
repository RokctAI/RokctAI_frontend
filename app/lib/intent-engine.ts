/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
