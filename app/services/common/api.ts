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
