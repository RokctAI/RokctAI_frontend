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

// The division hider (agent_sdk 1.29.0; Ray, 2026-11-21: "hide all divisions
// that don't have sites or repos. Similar mechanism as how repos announce
// themselves to cortex"). Like the CORTEX showcase, each division's
// site or repo carries a card, .rokct/division.json, and RokctAI/
// shared-workflows division-announce.yml copies it into this shell's
// divisions/<owner>__<repo>.json by pull request. A division is drawn only
// when at least one valid card names it. Pure: the fs read is in
// rokct-divisions.server.ts, so this module runs under node tests.

export const DIVISIONS_DIR = "divisions";
export const DIVISION_CARD_MAX_BYTES = 4096;

/** Every division, in page order. Names stay English (proper nouns). */
export const RK_DIVISIONS = [
  { id: "helios-foundry", name: "Helios Foundry", key: "helios_foundry" },
  { id: "juvo-platforms", name: "Juvo Platforms", key: "juvo_platforms" },
  { id: "polaris", name: "Polaris", key: "polaris" },
  { id: "cortex-media", name: "CORTEX", key: "cortex_media" },
  { id: "equinox-industries", name: "Equinox Industries", key: "equinox_industries" },
  { id: "locus", name: "Locus", key: "locus" },
  { id: "soma", name: "Soma", key: "soma" },
  { id: "tensor", name: "Tensor", key: "tensor" },
] as const;

export type DivisionId = (typeof RK_DIVISIONS)[number]["id"];
export type Division = (typeof RK_DIVISIONS)[number] & { url?: string };

const IDS = new Set<string>(RK_DIVISIONS.map((d) => d.id));
const REPO = /^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/;

export interface DivisionCard {
  division: DivisionId;
  repo: string;
  url?: string;
}

/** A card, or null when it does not pass: known division, owner/repo, https url, file named after the repo. */
export function parseDivisionCard(fileName: string, text: string): DivisionCard | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const c = raw as Record<string, unknown>;
  if (typeof c.division !== "string" || !IDS.has(c.division)) return null;
  if (typeof c.repo !== "string" || !REPO.test(c.repo)) return null;
  if (fileName !== c.repo.replace("/", "__") + ".json") return null;
  let url: string | undefined;
  if (c.url !== undefined) {
    if (typeof c.url !== "string" || !/^https:\/\/[^\s"<>]+$/.test(c.url)) return null;
    url = c.url;
  }
  return { division: c.division as DivisionId, repo: c.repo, url };
}

/** The divisions some card announced, in page order, each with the first card's site url. */
export function visibleDivisions(files: { name: string; text: string }[]): Division[] {
  const byId = new Map<string, DivisionCard>();
  for (const f of [...files].sort((a, b) => a.name.localeCompare(b.name))) {
    const card = parseDivisionCard(f.name, f.text);
    if (!card) continue;
    const had = byId.get(card.division);
    if (!had || (!had.url && card.url)) byId.set(card.division, card);
  }
  return RK_DIVISIONS.filter((d) => byId.has(d.id)).map((d) => ({ ...d, url: byId.get(d.id)?.url }));
}
