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

import "server-only";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { and, desc, eq, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { user, chat, User, reservation, personalTask } from "./schema";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// Merge sslmode=require into the connection URL instead of concatenating it.
//
// This used to be `${POSTGRES_URL}?sslmode=require`. When the value already
// carries a query string - the normal Neon/Supabase shape - that appends a
// SECOND "?", and the driver folds it into the last parameter it sees:
//   ...?channel_binding=require&sslmode=require  ->  ssl="require?sslmode=require"
//   ...?pgbouncer=true&connection_limit=1        ->  ssl=false, connection_limit="1?sslmode=require"
// The first is an unrecognised TLS mode, so postgres-js skips the
// rejectUnauthorized:false it applies for a real "require" and demands full
// certificate verification; the second drops TLS entirely and corrupts the
// pooler setting. Either way the parameter that was meant to be added is the
// one that breaks.
//
// Set sslmode only when the operator has not already chosen one, and leave
// every existing parameter untouched.
function withSslMode(url: string): string {
  try {
    let parsed = new URL(url);
    if (!parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }
    return parsed.toString();
  } catch {
    // Not parseable as a URL. Hand it to the driver unchanged rather than
    // throwing: this runs at module scope (see the note below).
    console.error(
      "POSTGRES_URL is not a parseable URL; passing it to the driver without merging sslmode=require.",
    );
    return url;
  }
}

let client;
if (
  process.env.POSTGRES_URL &&
  process.env.POSTGRES_URL !== "postgres://dummy:dummy@dummy/dummy"
) {
  client = postgres(withSslMode(process.env.POSTGRES_URL));
} else {
  // No usable POSTGRES_URL. postgres({}) does not throw here - it quietly
  // defaults to localhost:5432 - so the misconfiguration otherwise surfaces
  // much later as ECONNREFUSED 127.0.0.1:5432 from whatever query runs first,
  // with nothing naming the variable that is actually missing. Say so now.
  //
  // The fallback itself is kept on purpose. This module is imported at the top
  // level by the composed (chat) route handlers and by app/(chat)/chat/[id],
  // and `next build` evaluates it while collecting page data, so throwing here
  // would turn a build that currently needs no database into a hard failure
  // ("Failed to collect page data for /api/history/clear"). That is the same
  // trap db/index.ts documents having fallen into and deliberately backed out
  // of; this line makes the cause legible without moving when it fails.
  console.error(
    "POSTGRES_URL is not set (or is still the dummy placeholder). Falling back to the postgres-js default of localhost:5432; database queries will fail until POSTGRES_URL is configured.",
  );
  client = postgres({});
}
let db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: any;
  userId: string;
}) {
  try {
    const selectedChats = await db.select().from(chat).where(eq(chat.id, id));

    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({
          messages: JSON.stringify(messages),
        })
        .where(eq(chat.id, id));
    }

    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      messages: JSON.stringify(messages),
      userId,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    return await db.delete(chat).where(eq(chat.userId, userId));
  } catch (error) {
    console.error("Failed to delete all chats by user id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function createReservation({
  id,
  userId,
  details,
}: {
  id: string;
  userId: string;
  details: any;
}) {
  return await db.insert(reservation).values({
    id,
    createdAt: new Date(),
    userId,
    hasCompletedPayment: false,
    details: JSON.stringify(details),
  });
}

export async function getReservationById({ id }: { id: string }) {
  const [selectedReservation] = await db
    .select()
    .from(reservation)
    .where(eq(reservation.id, id));

  return selectedReservation;
}

export async function updateReservation({
  id,
  hasCompletedPayment,
}: {
  id: string;
  hasCompletedPayment: boolean;
}) {
  return await db
    .update(reservation)
    .set({
      hasCompletedPayment,
    })
    .where(eq(reservation.id, id));
}

// Personal Task Queries
export async function createPersonalTask(props: {
  userId: string;
  title: string;
  description?: string;
}) {
  try {
    const [newTask] = await db
      .insert(personalTask)
      .values({
        userId: props.userId,
        title: props.title,
        description: props.description,
      })
      .returning();
    return newTask;
  } catch (error) {
    console.error("Failed to create personal task", error);
    throw error;
  }
}

export async function setPersonalTaskReminder(props: {
  taskId: string;
  reminderAt: Date;
}) {
  try {
    return await db
      .update(personalTask)
      .set({ reminder_at: props.reminderAt })
      .where(eq(personalTask.id, props.taskId));
  } catch (error) {
    console.error("Failed to set personal task reminder", error);
    throw error;
  }
}

export async function getPendingReminders({ userId }: { userId: string }) {
  try {
    return await db
      .select()
      .from(personalTask)
      .where(
        and(
          eq(personalTask.userId, userId),
          eq(personalTask.is_dismissed, false),
          lte(personalTask.reminder_at, new Date()),
        ),
      );
  } catch (error) {
    console.error("Failed to get pending reminders", error);
    throw error;
  }
}

export async function deletePersonalTask({ taskId }: { taskId: string }) {
  try {
    return await db.delete(personalTask).where(eq(personalTask.id, taskId));
  } catch (error) {
    console.error("Failed to delete personal task", error);
    throw error;
  }
}
