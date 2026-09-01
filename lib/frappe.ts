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

import { FrappeApp } from "frappe-js-sdk";

export function getFrappeClient({
  apiKey,
  apiSecret,
  url,
}: { apiKey?: string; apiSecret?: string; url?: string } = {}) {
  const frappeUrl =
    url ||
    process.env.NEXT_PUBLIC_FRAPPE_URL ||
    process.env.ROKCT_BASE_URL ||
    "";

  if (apiKey && apiSecret) {
    return new FrappeApp(frappeUrl, {
      useToken: true,
      token: () => `${apiKey}:${apiSecret}`,
      type: "token",
    });
  }

  return new FrappeApp(frappeUrl);
}

export const db = () => getFrappeClient().db();
