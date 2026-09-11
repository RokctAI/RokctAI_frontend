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

import { CoreMessage } from "ai";
import { notFound } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { Chat as PreviewChat } from "@/components/custom/chat";
import { Chat } from "@/db/schema";
import { convertToUIMessages } from "@/lib/utils";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next 15+ hands a route segment its params as a Promise.
  const { id } = await params;

  // The session first: the read below is only ever made on a caller's behalf.
  const session = await auth();

  if (!session || !session.user) {
    return notFound();
  }

  // A failed read is a missing chat to the visitor, not a 500.
  let chatFromDb;
  try {
    const { getChatById } = await import("@/db/queries");
    chatFromDb = await getChatById({ id });
  } catch (e) {
    console.error(
      `[chat/[id]] Failed to load chat ${id}: ${e instanceof Error ? e.message : String(e)}`,
    );
    notFound();
  }

  if (!chatFromDb) {
    notFound();
  }

  // type casting and converting messages to UI messages
  const chat: Chat = {
    ...chatFromDb,
    messages: convertToUIMessages(chatFromDb.messages as Array<CoreMessage>),
  };

  if (session.user.id !== chat.userId) {
    return notFound();
  }

  const isPaidUser =
    !session?.user?.is_free_plan &&
    (session?.user?.status === "Active" ||
      session?.user?.status === "Trialing");

  return (
    <PreviewChat
      id={chat.id}
      initialMessages={chat.messages}
      isPaidUser={isPaidUser}
    />
  );
}
