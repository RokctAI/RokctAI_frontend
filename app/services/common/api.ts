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

export async function callPublicApi(
  method: string,
  params: Record<string, any> = {},
  options: RequestInit & { timeout?: number } = {},
) {
  const baseUrl = process.env.ROKCT_BASE_URL;
  if (!baseUrl) return null;

  const { timeout = 10000, ...fetchOptions } = options;

  try {
    const query = new URLSearchParams(params).toString();
    const url = `${baseUrl}/api/method/${method}${query ? `?${query}` : ""}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const defaultOptions: RequestInit = {
      next: { revalidate: 60 },
      signal: controller.signal,
    };

    const finalOptions = {
      ...defaultOptions,
      ...fetchOptions,
      headers: { ...defaultOptions.headers, ...fetchOptions.headers },
      signal: controller.signal, // Ensure signal is set
    };

    try {
      const res = await fetch(url, finalOptions);
      clearTimeout(timeoutId);

      if (!res.ok) return null;

      const data = await res.json();
      return data.message || data;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (e) {
    console.error(`API Call Failed: ${method}`, e);
    return null;
  }
}
