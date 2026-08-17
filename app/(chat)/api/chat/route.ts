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
import { saveChat, getChatById, deleteChatById } from "@/db/queries";
import { getAuthenticatedTokens } from "@/app/lib/auth-utils";

// Token rotation and renewal are handled by getAuthenticatedTokens() which calls refreshTokens() before expiry.
export async function POST(request: Request) {
  const { id, messages, model } = await request.json();
  
  let tokens;
  try {
    tokens = await getAuthenticatedTokens();
  } catch (e) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Filter messages to get only non-empty ones
  const coreMessages = messages.filter((m: any) => m.content && m.content.length > 0);
  const userMessage = coreMessages[coreMessages.length - 1]?.content || "";

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  // Resolve base domain and call appropriate VPS chat bridge
  const isBusiness = !!session.user.siteName;
  let responseMessage = "";
  let chatRes: any = null;
  let newSessionId: string | null = null;

  // Threshold logic: 20 messages (10 conversation turns)
  const ROLLING_THRESHOLD = 20;
  const shouldRoll = coreMessages.length >= ROLLING_THRESHOLD;

  try {
    let messageToSend = userMessage;

    // First message in a session: Fetch the last rolled context summary as the Golden Thread
    if (coreMessages.length === 1 && !shouldRoll) {
      try {
        const { db } = await import("@/db");
        const { user: userTable } = await import("@/db/schema");
        const { eq } = await import("drizzle-orm");

        const dbUser = await db
          .select()
          .from(userTable)
          .where(eq(userTable.id, session.user.id))
          .limit(1);

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
    if (shouldRoll) {
      const { generateUUID } = await import("@/lib/utils");
      newSessionId = generateUUID();
      console.log(`[Session Roll] Threshold reached. Transitioning ${id} -> ${newSessionId}`);

      let summary = "";
      try {
        if (isBusiness) {
          const { getClient } = await import("@/app/lib/client");
          const client = await getClient();
          const sumRes = await (client as any).call({
            method: "rcore.api.plan_builder.summarize_chat_session",
            args: {
              session_id: id,
              messages: JSON.stringify(coreMessages),
            },
          });
          summary = sumRes?.summary || "";
        } else {
          const { ControlBaseService } = await import("@/app/services/control/base");
          const sumRes = await ControlBaseService.call("control.api.summarize_chat_session", {
            session_id: id,
            messages: JSON.stringify(coreMessages),
          });
          summary = sumRes?.summary || "";
        }
      } catch (err) {
        console.error("Failed to summarize old session:", err);
      }

      if (summary) {
        messageToSend = `[SYSTEM MEMORY blueprinted from completed session ${id}]:\n${summary}\n\n[USER NEW MESSAGE]:\n${userMessage}`;

        // Save context summary to User table JSON
        try {
          const { db } = await import("@/db");
          const { user: userTable } = await import("@/db/schema");
          const { eq } = await import("drizzle-orm");

          const dbUser = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, session.user.id))
            .limit(1);

          const currentData = (dbUser[0]?.onboardingData as Record<string, any>) || {};
          await db
            .update(userTable)
            .set({
              onboardingData: {
                ...currentData,
                lastSummary: summary
              }
            })
            .where(eq(userTable.id, session.user.id));
        } catch (err) {
          console.error("Failed to save summary context:", err);
        }
      }

      // Delete the old raw chat session completely to keep DB clean
      try {
        const { deleteChatById } = await import("@/db/queries");
        await deleteChatById({ id });
        console.log(`[Auto-Clean] Cleaned up completed session ${id} from local logs.`);
      } catch (err) {
        console.error("Failed to clean up old session:", err);
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
          "Authorization": `Bearer ${process.env.PAPERCLIP_API_TOKEN || ""}`
        },
        body: JSON.stringify({
          id: activeSessionId,
          messages: [...coreMessages, { role: "user", content: messageToSend }],
          model
        })
      });
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

    if (chatRes && chatRes.message) {
      responseMessage = chatRes.message;
    } else {
      const errMessage = chatRes?.error || "I encountered an error connecting to ROK.";
      if (errMessage.includes("Quota Exceeded")) {
        return new Response(errMessage, { status: 403 });
      }
      responseMessage = errMessage;
    }

    // Onboarding Completion Detection: if completed, trigger an immediate session roll in background
    const isOnboardingComplete = 
      responseMessage.toLowerCase().includes("committed successfully") || 
      responseMessage.toLowerCase().includes("database plan updated") ||
      responseMessage.toLowerCase().includes("plan on a page committed");

    if (isOnboardingComplete && !newSessionId) {
      const { generateUUID } = await import("@/lib/utils");
      newSessionId = generateUUID();
      console.log(`[Onboarding Complete Roll] Onboarding completed. Auto-rolling ${id} -> ${newSessionId}`);

      let onboardingSummary = "";
      try {
        const fullMessagesHistory = [...coreMessages, { role: "assistant", content: responseMessage }];
        if (isBusiness) {
          const { getClient } = await import("@/app/lib/client");
          const client = await getClient();
          const sumRes = await (client as any).call({
            method: "rcore.api.plan_builder.summarize_chat_session",
            args: {
              session_id: id,
              messages: JSON.stringify(fullMessagesHistory),
            },
          });
          onboardingSummary = sumRes?.summary || "";
        } else {
          const { ControlBaseService } = await import("@/app/services/control/base");
          const sumRes = await ControlBaseService.call("control.api.summarize_chat_session", {
            session_id: id,
            messages: JSON.stringify(fullMessagesHistory),
          });
          onboardingSummary = sumRes?.summary || "";
        }
      } catch (err) {
        console.error("Failed to summarize onboarding session:", err);
      }

      if (onboardingSummary) {
        // Save onboarding summary context to User table JSON
        try {
          const { db } = await import("@/db");
          const { user: userTable } = await import("@/db/schema");
          const { eq } = await import("drizzle-orm");

          const dbUser = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, session.user.id))
            .limit(1);

          const currentData = (dbUser[0]?.onboardingData as Record<string, any>) || {};
          await db
            .update(userTable)
            .set({
              onboardingData: {
                ...currentData,
                lastSummary: onboardingSummary
              }
            })
            .where(eq(userTable.id, session.user.id));
        } catch (err) {
          console.error("Failed to save onboarding summary context:", err);
        }
      }

      // Delete the onboarding chat session
      try {
        const { deleteChatById } = await import("@/db/queries");
        await deleteChatById({ id });
        console.log(`[Auto-Clean] Cleaned up onboarding session ${id} from logs.`);
      } catch (err) {
        console.error("Failed to clean up onboarding session:", err);
      }
    }
  } catch (e: any) {
    console.error("ROK Chat failed:", e);
    const errMessage = e?.message || e?.description || "Failed to communicate with ROK on the remote VPS.";
    if (errMessage.includes("Quota Exceeded")) {
      return new Response(errMessage, { status: 403 });
    }
    responseMessage = errMessage;
  }

  // Save the chat locally for web history persistence
  const targetIdToSave = newSessionId || id;
  try {
    await saveChat({
      id: targetIdToSave,
      messages: [
        ...coreMessages,
        { 
          role: "assistant", 
          content: responseMessage,
          ...(chatRes && chatRes.tool_calls && chatRes.tool_calls.length > 0 ? {
            toolInvocations: chatRes.tool_calls.map((tc: any) => {
              let args = {};
              try {
                args = typeof tc.function.arguments === 'string' 
                  ? JSON.parse(tc.function.arguments) 
                  : tc.function.arguments;
              } catch (e) {}
              return {
                state: "result",
                toolCallId: tc.id,
                toolName: tc.function.name,
                args,
                result: args
              };
            })
          } : {})
        }
      ],
      userId: session.user.id,
    });
  } catch (error) {
    console.error("Failed to save chat locally:", error);
  }

  // Return standard Vercel AI SDK Data Stream Protocol response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Stream tool calls/results if they exist
      if (chatRes && chatRes.tool_calls && chatRes.tool_calls.length > 0) {
        for (const tc of chatRes.tool_calls) {
          const toolCallId = tc.id;
          const toolName = tc.function.name;
          let args = {};
          try {
            args = typeof tc.function.arguments === 'string' 
              ? JSON.parse(tc.function.arguments) 
              : tc.function.arguments;
          } catch (e) {
            console.error("Failed to parse tool call arguments:", e);
          }

          const callPayload = `9:${JSON.stringify({ toolCallId, toolName, args })}\n`;
          controller.enqueue(encoder.encode(callPayload));

          const resultPayload = `a:${JSON.stringify({ toolCallId, toolName, result: args })}\n`;
          controller.enqueue(encoder.encode(resultPayload));
        }
      }

      const chunks = responseMessage.split(/(\s+)/);
      for (const chunk of chunks) {
        const payload = `0:${JSON.stringify(chunk)}\n`;
        controller.enqueue(encoder.encode(payload));
        await new Promise((resolve) => setTimeout(resolve, 15)); // Smooth typing simulation
      }
      controller.close();
    }
  });

  const responseHeaders: Record<string, string> = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  };

  if (newSessionId) {
    responseHeaders["X-New-Session-Id"] = newSessionId;
  }

  return new Response(stream, {
    headers: responseHeaders
  });
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

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });
    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
