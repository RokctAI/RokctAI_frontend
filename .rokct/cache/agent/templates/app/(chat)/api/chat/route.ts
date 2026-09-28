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

import { createUIMessageStream, createUIMessageStreamResponse } from "ai";

import { auth } from "@/app/(auth)/auth";
import { saveChat, getChatById, deleteChatById } from "@/db/queries";
import { getAuthenticatedTokens } from "@/app/lib/auth-utils";
import {
  ChatAttachment,
  ChatToolInvocation,
  messageFiles,
  messageText,
  toStoredMessage,
  turnText,
} from "@/lib/agent-chat-messages";

// Threshold logic: 20 messages (10 conversation turns). Past it the session
// rolls: its summary becomes the new session's memory, the new session
// starts from that summary plus this turn, and the client moves to it.
const ROLLING_THRESHOLD = 20;

/** A 403 for the browser. `X-Rok-Refusal: quota` marks the daily free
 * quota (the bridges' "Quota Exceeded:" refusal), the one refusal the chat
 * answers by switching to the offline flow; seat and plan refusals only
 * show their line. */
function refusal(message: string): Response {
  const isQuota = /^\s*Quota Exceeded:/i.test(message);
  return new Response(message, {
    status: 403,
    headers: isQuota ? { "X-Rok-Refusal": "quota" } : {},
  });
}

type Turn = { role: "user" | "assistant"; text: string; files: ChatAttachment[] };

/** A refusal the backend sent as 403 (quota, seat limit, plan gate). */
function isForbidden(e: any): boolean {
  return (
    e?.status === 403 ||
    e?.httpStatus === 403 ||
    e?.statusCode === 403 ||
    e?.response?.status === 403
  );
}

/** Frappe's `_server_messages`: a JSON array of JSON-encoded {message}. */
function firstServerMessage(raw: unknown): string {
  if (typeof raw !== "string") return "";
  try {
    const list = JSON.parse(raw);
    for (const item of Array.isArray(list) ? list : []) {
      const parsed = typeof item === "string" ? JSON.parse(item) : item;
      const text = typeof parsed === "string" ? parsed : parsed?.message;
      if (typeof text === "string" && text.trim()) return text;
    }
  } catch {
    // not the JSON Frappe sends; ignore it
  }
  return "";
}

/** The reason a 403 carries, for the refusal toast; never a stack or a URL. */
function forbiddenMessage(e: any): string {
  const data = e?.response?.data ?? e?.body;
  const candidates = [
    data?.message,
    data?.exception,
    firstServerMessage(data?._server_messages),
    e?.message,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim() && !c.startsWith("Platform gateway call failed")) {
      return c.replace(/^.*PermissionError:\s*/, "");
    }
  }
  return "Your conversational ROK quota is complete.";
}

/** Summarizes a session through the tenant or control bridge; "" on failure. */
async function summarizeSession(
  isBusiness: boolean,
  sessionId: string,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  try {
    if (isBusiness) {
      const { getClient } = await import("@/app/lib/client");
      const { gatewayCall } = await import("@/app/lib/gateway-rpc");
      const client = await getClient();
      const sumRes = await gatewayCall(client, "api.plan_builder.summarize_chat_session", {
        session_id: sessionId,
        messages: JSON.stringify(messages),
      });
      return sumRes?.message?.summary || "";
    }
    const { ControlBaseService } = await import("@/app/services/control/base");
    const sumRes = await ControlBaseService.call("control:summarize_chat_session", {
      session_id: sessionId,
      messages: JSON.stringify(messages),
    });
    return sumRes?.message?.summary || "";
  } catch (err) {
    console.error("Failed to summarize session:", err);
    return "";
  }
}

/** Stores a summary as the user's Golden Thread memory; true once saved. */
async function saveLastSummary(userId: string, summary: string): Promise<boolean> {
  try {
    const { db } = await import("@/db");
    const { user: userTable } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const dbUser = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1);
    const currentData = (dbUser[0]?.onboardingData as Record<string, any>) || {};
    await db
      .update(userTable)
      .set({ onboardingData: { ...currentData, lastSummary: summary } })
      .where(eq(userTable.id, userId));
    return true;
  } catch (err) {
    console.error("Failed to save summary context:", err);
    return false;
  }
}

// Token rotation and renewal are handled by getAuthenticatedTokens() which calls refreshTokens() before expiry.
export async function POST(request: Request) {
  const { id, messages, model } = await request.json();

  try {
    await getAuthenticatedTokens();
  } catch (e) {
    return new Response("Unauthorized", { status: 401 });
  }

  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  if (!id || typeof id !== "string") {
    return new Response("Chat id is required", { status: 400 });
  }

  // The chat id comes from the request body: before anything is saved or
  // deleted under it, make sure it is not someone else's chat (the DELETE
  // handler below applies the same rule).
  let existingChat: Awaited<ReturnType<typeof getChatById>> | null = null;
  try {
    existingChat = await getChatById({ id });
  } catch (err) {
    // Without the lookup the owner is unknown: nothing may be written.
    console.error("Failed to look up chat before saving:", err);
    return new Response("Chat storage is unavailable right now.", { status: 503 });
  }
  if (existingChat && existingChat.userId !== userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const ownsExistingChat = !!existingChat;

  // AI SDK 6 sends UIMessages (parts); older rows and clients send content.
  const turns: Turn[] = (Array.isArray(messages) ? messages : [])
    .filter((m: any) => m && (m.role === "user" || m.role === "assistant"))
    .map((m: any) => ({ role: m.role, text: messageText(m), files: messageFiles(m) }))
    .filter((t: Turn) => t.text.length > 0 || t.files.length > 0);

  const lastTurn = turns[turns.length - 1];
  const userMessage = lastTurn && lastTurn.role === "user" ? turnText(lastTurn.text, lastTurn.files) : "";
  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }
  const coreMessages = turns.map((t) => ({ role: t.role, content: turnText(t.text, t.files) }));

  const isBusiness = !!session.user.siteName;
  let responseMessage = "";
  let chatRes: any = null;
  let newSessionId: string | null = null;
  const shouldRoll = coreMessages.length >= ROLLING_THRESHOLD;

  try {
    let messageToSend = userMessage;

    // First message in a session: Fetch the last rolled context summary as the Golden Thread
    if (coreMessages.length === 1 && !shouldRoll) {
      try {
        const { db } = await import("@/db");
        const { user: userTable } = await import("@/db/schema");
        const { eq } = await import("drizzle-orm");

        const dbUser = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1);

        const lastSummary = (dbUser[0]?.onboardingData as any)?.lastSummary;
        if (lastSummary) {
          console.log(`[Golden Thread Context] Injecting memory from previous sessions.`);
          messageToSend = `[SYSTEM MEMORY blueprinted from completed sessions]:\n${lastSummary}\n\n[USER NEW MESSAGE]:\n${userMessage}`;
        }
      } catch (err) {
        console.error("Failed to query and inject golden thread context:", err);
      }
    }

    // If rolling session, summarize old context and inject it as Golden Thread memory
    // An empty summary does not roll: the session stays whole and the roll
    // is tried again on the next turn.
    if (shouldRoll) {
      const summary = await summarizeSession(isBusiness, id, coreMessages);
      if (summary) {
        const { generateUUID } = await import("@/lib/utils");
        newSessionId = generateUUID();
        console.log(`[Session Roll] Threshold reached. Transitioning ${id} -> ${newSessionId}`);
        messageToSend = `[SYSTEM MEMORY blueprinted from completed session ${id}]:\n${summary}\n\n[USER NEW MESSAGE]:\n${userMessage}`;

        // Delete the old raw chat only once its summary is saved, so a failed
        // summary never loses the conversation.
        const saved = await saveLastSummary(userId, summary);
        if (saved && ownsExistingChat) {
          try {
            await deleteChatById({ id, userId });
            console.log(`[Auto-Clean] Cleaned up completed session ${id} from local logs.`);
          } catch (err) {
            console.error("Failed to clean up old session:", err);
          }
        }
      }
    }

    const activeSessionId = newSessionId || id;
    const isEmployeePlan = session.user.plan === "Employee Plan" || session.user.subscriptionTier === "Employee Plan";

    if (isEmployeePlan) {
      // Forward chat turns of Employee Plan users directly to Paperclip
      const paperclipUrl = process.env.PAPERCLIP_API_URL || "https://platform.rokct.ai/paperclip/api/chat";
      const paperclipRes = await fetch(paperclipUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.PAPERCLIP_API_TOKEN || ""}`,
          // Layer 12: propagate the inbound trace id (or mint one) so the
          // Paperclip hop stays correlated with this request.
          "x-trace-id": request.headers.get("x-trace-id") ?? crypto.randomUUID()
        },
        body: JSON.stringify({
          id: activeSessionId,
          // The history without this turn, then this turn once (with its
          // memory prefix): the latest user message is not sent twice.
          messages: [...coreMessages.slice(0, -1), { role: "user", content: messageToSend }],
          model
        })
      });
      if (paperclipRes.status === 403) {
        return refusal(await paperclipRes.text());
      }
      if (paperclipRes.ok) {
        chatRes = await paperclipRes.json();
      } else {
        throw new Error("Failed to communicate with Paperclip agent host.");
      }
    } else if (isBusiness) {
      const { OnboardingService } = await import("@/app/services/tenant/onboarding");
      chatRes = await OnboardingService.chatWithRok(messageToSend, activeSessionId, model);
    } else {
      const { OnboardingService } = await import("@/app/services/control/onboarding");
      chatRes = await OnboardingService.chatWithRok(messageToSend, activeSessionId, model);
    }

    // The backend bridges answer failures with {status: "error", message};
    // that message is an error, never the assistant's answer, and it is not
    // saved into the history.
    if (!chatRes || chatRes.status === "error" || typeof chatRes.message !== "string" || !chatRes.message) {
      console.error("ROK Chat returned an error:", chatRes?.message);
      return new Response("ROK is unavailable right now. Please try again shortly.", { status: 502 });
    }
    responseMessage = chatRes.message;

    // Onboarding Completion Detection: if completed, trigger an immediate session roll
    const lowered = responseMessage.toLowerCase();
    const isOnboardingComplete =
      lowered.includes("committed successfully") ||
      lowered.includes("database plan updated") ||
      lowered.includes("plan on a page committed");

    if (isOnboardingComplete && !newSessionId) {
      const fullMessagesHistory = [...coreMessages, { role: "assistant", content: responseMessage }];
      const onboardingSummary = await summarizeSession(isBusiness, id, fullMessagesHistory);
      // Like the threshold roll: no summary, no roll.
      if (onboardingSummary) {
        const { generateUUID } = await import("@/lib/utils");
        newSessionId = generateUUID();
        console.log(`[Onboarding Complete Roll] Onboarding completed. Auto-rolling ${id} -> ${newSessionId}`);
        // Delete the onboarding chat session only once its summary is saved.
        const saved = await saveLastSummary(userId, onboardingSummary);
        if (saved && ownsExistingChat) {
          try {
            await deleteChatById({ id, userId });
            console.log(`[Auto-Clean] Cleaned up onboarding session ${id} from logs.`);
          } catch (err) {
            console.error("Failed to clean up onboarding session:", err);
          }
        }
      }
    }
  } catch (e: any) {
    console.error("ROK Chat failed:", e);
    // Quota, seat-limit and plan refusals come back from the bridges as 403.
    if (isForbidden(e)) {
      return refusal(forbiddenMessage(e));
    }
    // A failed turn is an error response, not an assistant message saved
    // into the chat history.
    return new Response("Failed to communicate with ROK.", { status: 502 });
  }

  const toolInvocations: ChatToolInvocation[] = Array.isArray(chatRes?.tool_calls)
    ? chatRes.tool_calls.map((tc: any) => {
        let args: any = {};
        try {
          args = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments;
        } catch (e) {
          console.error("Failed to parse tool call arguments:", e);
        }
        return { state: "result", toolCallId: tc.id, toolName: tc.function.name, args, result: args };
      })
    : [];

  // Save the chat locally for web history persistence. A rolled session
  // starts from this turn alone (its memory is the summary), so the client,
  // which moves to the new id, does not roll again on the next turn.
  const targetIdToSave = newSessionId || id;
  const historyTurns = newSessionId ? turns.slice(-1) : turns;
  try {
    await saveChat({
      id: targetIdToSave,
      messages: [
        ...historyTurns.map((t) => toStoredMessage({ role: t.role, text: t.text, files: t.files })),
        toStoredMessage({ role: "assistant", text: responseMessage, toolInvocations }),
      ],
      userId,
    });
  } catch (error) {
    console.error("Failed to save chat locally:", error);
  }

  // AI SDK 6 UI message stream: the new session id first (as a transient
  // data part the chat reads to move to it), the tool results, the text.
  const rolledTo = newSessionId;
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      if (rolledTo) {
        writer.write({ type: "data-session", data: { id: rolledTo }, transient: true });
      }
      for (const tc of toolInvocations) {
        writer.write({ type: "tool-input-available", toolCallId: tc.toolCallId, toolName: tc.toolName, input: tc.args, dynamic: true });
        writer.write({ type: "tool-output-available", toolCallId: tc.toolCallId, output: tc.result, dynamic: true });
      }
      const textId = crypto.randomUUID();
      writer.write({ type: "text-start", id: textId });
      for (const chunk of responseMessage.split(/(\s+)/)) {
        if (!chunk) continue;
        writer.write({ type: "text-delta", id: textId, delta: chunk });
        await new Promise((resolve) => setTimeout(resolve, 15)); // Smooth typing simulation
      }
      writer.write({ type: "text-end", id: textId });
    },
  });

  const headers: Record<string, string> = { "Cache-Control": "no-cache" };
  if (newSessionId) {
    headers["X-New-Session-Id"] = newSessionId;
  }
  return createUIMessageStreamResponse({ stream, headers });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (!chat) {
      return new Response("Not Found", { status: 404 });
    }

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id, userId: session.user.id });
    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
