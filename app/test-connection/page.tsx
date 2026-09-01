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

import { getFrappeClient } from "@/lib/frappe";

export default async function TestConnectionPage() {
  let message = "Testing connection...";
  let error = null;
  let data = null;

  try {
    const frappe = getFrappeClient();
    const call = frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "User",
        limit_page_length: 1,
      },
    });

    // Await the promise to get the actual response
    const response = await call;
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
