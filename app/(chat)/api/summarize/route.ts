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
      const client = await getClient();
      sumRes = await (client as any).call({
        method: "rcore.api.plan_builder.summarize_chat_session",
        args: {
          session_id: sessionId,
          messages: JSON.stringify(messages),
        },
      });
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
