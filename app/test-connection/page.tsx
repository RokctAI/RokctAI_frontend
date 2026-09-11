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

import { platformCall } from "@/app/services/base/platform-gateway";

export default async function TestConnectionPage() {
  let message = "Testing connection...";
  let error = null;
  let data = null;

  try {
    // This page exists to prove the backend answers, so it has to actually
    // ask. It did not: `FrappeApp.call()` takes ZERO arguments and returns a
    // `FrappeCall` (frappe-js-sdk 1.12.0, `lib/frappe_app/index.d.ts`), so
    // the `{method, args}` object was discarded, no HTTP request was made,
    // and awaiting the returned builder could not throw — the page reported
    // "Connection Successful!" and printed an SDK object as "Data Received"
    // against any backend at all, reachable or not. The compiler was already
    // saying so: `TS2554: Expected 0 arguments, but got 1` on `main`.
    //
    // Now it asks through the ONE platform gateway (ADR-005), with
    // `throwOnError` so an unreachable or refusing backend reaches the
    // catch below and renders "Connection Failed".
    const response = await platformCall<Record<string, any>>(
      "frappe.client.get_list",
      {
        doctype: "User",
        limit_page_length: 1,
      },
      { throwOnError: true },
    );
    data = response;
    message = "Connection Successful!";
  } catch (e: any) {
    console.error(e);
    error = e.message || "Unknown error";
    message = "Connection Failed";
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">{message}</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>
            <strong>Error:</strong> {error}
          </p>
          <p className="text-sm mt-2">
            Make sure ROKCT_BASE_URL is set and reachable.
          </p>
        </div>
      )}

      {data && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>
            <strong>Data Received:</strong>
          </p>
          <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
