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

import { redirect } from "next/navigation";
import { getCurrentSession } from "@/app/(auth)/actions";
import { AI_FIRST } from "@/app/config/compose";
import { Chat } from "@/components/custom/chat";
import { PaaSLogin } from "@/components/custom/paas-login";
import { generateUUID } from "@/lib/utils";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getCurrentSession();

  if (!session || !session.user) {
    const params = await searchParams;
    const siteName = params?.site_name;

    if (!siteName) {
      redirect("/landing");
    }

    return <PaaSLogin />;
  }

  // Compose-time gate: without the agent SDK there is no chat surface, so
  // authenticated (non-PaaS) users land on the hands-on workspace instead.
  // PaaS users never reach this page — auth.config.ts redirects them earlier.
  if (!AI_FIRST) {
    redirect("/handson");
  }

  // Auto-route: Summarize the last session, archive it as an Engram in DB, delete it, and start a completely fresh session
  try {
    if (session.user.id && session.user.email) {
      const { getChatsByUserId, deleteChatById } = await import("@/db/queries");
      const chats = await getChatsByUserId({ id: session.user.id });

      if (chats && chats.length > 0) {
        const lastChat = chats[0];
        console.log(
          `[Auto-Archive] Found old session ${lastChat.id} on /. Compacting memory and deleting raw logs.`,
        );

        let summary = "";
        const isBusiness = !!session.user.siteName;

        try {
          if (isBusiness) {
            // Call Tenant site summarization
            const { getClient } = await import("@/app/lib/client");
            const client = await getClient();
            const sumRes = await (client as any).call({
              method: "rcore.api.plan_builder.summarize_chat_session",
              args: {
                session_id: lastChat.id,
                messages: JSON.stringify(lastChat.messages),
              },
            });
            summary = sumRes?.summary || "";
          } else {
            // Call Control site summarization
            const { ControlBaseService } =
              await import("@/app/services/control/base");
            const sumRes = await ControlBaseService.call(
              "control.api.summarize_chat_session",
              {
                session_id: lastChat.id,
                messages: JSON.stringify(lastChat.messages),
              },
            );
            summary = sumRes?.summary || "";
          }
        } catch (sumErr) {
          console.error(
            "Failed to summarize old session during archive:",
            sumErr,
          );
        }

        // Archive summary in local User table JSON field (onboardingData.lastSummary)
        if (summary) {
          const dbUser = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, session.user.id))
            .limit(1);

          const currentData =
            (dbUser[0]?.onboardingData as Record<string, any>) || {};
          await db
            .update(userTable)
            .set({
              onboardingData: {
                ...currentData,
                lastSummary: summary,
              },
            })
            .where(eq(userTable.id, session.user.id));
          console.log(
            `[Auto-Archive] Summary stored in user's engramMemory ledger.`,
          );
        }

        // Delete the old raw chat session completely to keep DB clean
        await deleteChatById({ id: lastChat.id });
        console.log(
          `[Auto-Archive] Cleaned up completed session ${lastChat.id} from local chat logs.`,
        );
      }
    }
  } catch (e) {
    console.error("Failed to archive latest chat session:", e);
  }

  // Redirect immediately to a brand new clean chat session
  redirect(`/chat/${generateUUID()}`);
}
