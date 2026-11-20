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

import en from "./en.json";
import { sdkTranslations } from "./sdk-registry";

// SDK copy: each SDK ships app/lib/i18n/sdk/<sdk>.json ({"en": {...},
// "af": {...}}) and scripts/compose.sh lists them in sdk-registry.ts. The
// shell's own en.json wins where both define a key.
function deepMerge(target: Record<string, any>, source: Record<string, any>) {
  for (const [k, v] of Object.entries(source || {})) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      if (!target[k] || typeof target[k] !== "object") target[k] = {};
      deepMerge(target[k], v);
    } else if (target[k] === undefined) {
      target[k] = v;
    }
  }
  return target;
}

const merged: Record<string, any> = JSON.parse(JSON.stringify(en));
for (const bundle of sdkTranslations) deepMerge(merged, bundle.en || {});

const translations: Record<string, any> = {
  en: merged,
};

// A key nobody translated shows as words, not as "app.x.some_key":
// "app.agent.memory_title" -> "Memory title".
export function humanizeKey(key: string): string {
  const last = key.split(".").pop() || key;
  const words = last.replace(/_/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : key;
}

export function t(
  key: string,
  params?: Record<string, string | number>,
): string {
  const keys = key.split(".");
  let value: any = translations.en;

  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      value = humanizeKey(key);
      break;
    }
  }

  if (typeof value === "string" && params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{{${k}}}`, String(v));
    });
  }

  return value || key;
}

export default t;
