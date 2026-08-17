/*
 * Copyright (c) 2026 RokctAI
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
