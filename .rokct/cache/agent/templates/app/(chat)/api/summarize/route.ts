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

import { auth } from "@/app/(auth)/auth";

export const revalidate = 0;

export async function POST(request: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { sessionId, messages } = await request.json();

    if (!sessionId || !messages || !Array.isArray(messages)) {
      return new Response("Invalid request arguments", { status: 400 });
    }

    const isBusiness = !!session.user.siteName;
    let sumRes;

    if (isBusiness) {
      // Call Tenant site summarization
      const { getClient } = await import("@/app/lib/client");
      const { gatewayCall } = await import("@/app/lib/gateway-rpc");
      const client = await getClient();
      const tenantRes = await gatewayCall(client, "api.plan_builder.summarize_chat_session", {
        session_id: sessionId,
        messages: JSON.stringify(messages),
      });
      sumRes = tenantRes?.message;
    } else {
      // Call Control site summarization
      const { ControlBaseService } = await import("@/app/services/control/base");
      sumRes = await ControlBaseService.call("control.api.summarize_chat_session", {
        session_id: sessionId,
        messages: JSON.stringify(messages),
      });
    }

    return Response.json({ success: true, summary: sumRes?.summary || sumRes });
  } catch (error: any) {
    console.error("Failed to summarize chat session:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
