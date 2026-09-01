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

const translations: Record<string, any> = {
  en,
};

export function t(key: string, params?: Record<string, string>): string {
  const keys = key.split(".");
  let value: any = translations.en;

  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      return key; // Fallback to key
    }
  }

  if (typeof value === "string" && params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{{${k}}}`, v);
    });
  }

  return value || key;
}

export default t;
