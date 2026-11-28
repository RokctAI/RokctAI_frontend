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

// Reads the shell's divisions/ registry (see rokct-divisions.ts), the way
// hosting_sdk's studio-showcase-load.ts reads showcase/. Server only.
import "server-only";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  DIVISIONS_DIR,
  DIVISION_CARD_MAX_BYTES,
  visibleDivisions,
  type Division,
} from "@/components/custom/landing/rokct-divisions";

export function loadDivisions(root: string = process.cwd()): Division[] {
  const dir = join(root, DIVISIONS_DIR);
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  const files: { name: string; text: string }[] = [];
  for (const name of names) {
    if (!name.endsWith(".json")) continue;
    try {
      const p = join(dir, name);
      const st = statSync(p);
      if (st.isFile() && st.size <= DIVISION_CARD_MAX_BYTES) files.push({ name, text: readFileSync(p, "utf8") });
    } catch {
      // unreadable card: skipped, as an unannounced division
    }
  }
  return visibleDivisions(files);
}
