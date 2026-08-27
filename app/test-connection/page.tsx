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
