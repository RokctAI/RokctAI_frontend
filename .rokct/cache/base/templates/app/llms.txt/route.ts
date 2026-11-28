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

// base_sdk 1.68.0: /llms.txt, what this site is for AI crawlers (app/lib/ai-discovery.ts).
import { loadSiteMetadata } from "@/components/custom/landing/site-metadata";
import { llmsTxt } from "@/app/lib/ai-discovery";
import { resolveSiteUrl } from "@/app/lib/site-metadata";

export async function GET(): Promise<Response> {
  const copy = await loadSiteMetadata();
  return new Response(llmsTxt(copy, resolveSiteUrl(copy)), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
