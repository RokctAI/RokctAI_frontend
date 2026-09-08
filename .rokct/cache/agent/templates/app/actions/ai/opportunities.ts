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

"use server";

// Server action in front of app/services/public/opportunities.ts for the
// landing hero's opportunities section (components/custom/landing/
// agent-opportunities.tsx, a client component). The service calls
// base_sdk's platform gateway, which is server-only since base_sdk 1.3.0
// (it reads the session and the request host per call), so a client
// component cannot import it directly; it calls this action instead.

import { OpportunityPublicService } from "@/app/services/public/opportunities";

export async function searchPublicOpportunities(query: string) {
  return OpportunityPublicService.search(query);
}
