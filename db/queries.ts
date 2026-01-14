import "server-only";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { and, desc, eq, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { user, chat, User, reservation, personalTask } from "./schema";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
let client;
if (process.env.POSTGRES_URL && process.env.POSTGRES_URL !== "postgres://dummy:dummy@dummy/dummy") {
    client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
} else {
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
    const [newTask] = await db.insert(personalTask).values({
      userId: props.userId,
      title: props.title,
      description: props.description,
    }).returning();
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
          lte(personalTask.reminder_at, new Date())
        )
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
