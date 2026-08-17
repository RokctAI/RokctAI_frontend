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

import { Message } from "ai";
import { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(), // Matching Frappe User ID (Email)
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
  siteName: varchar("siteName", { length: 255 }), // Stores the tenant URL (e.g., tenant-a.rokct.ai)
  apiKey: varchar("apiKey", { length: 255 }), // Stores the user's API Key
  apiSecret: varchar("apiSecret", { length: 255 }), // Stores the user's API Secret
  isOnboarded: boolean("isOnboarded").default(false), // Tracks if the user has completed the onboarding chat
  onboardingData: json("onboardingData"), // Stores the "Plan on a Page" JSON temporarily
  location: varchar("location", { length: 255 }), // Stores the user's default location (e.g. for Weather)
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  messages: json("messages").notNull(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => user.id),
});

export type Chat = Omit<InferSelectModel<typeof chat>, "messages"> & {
  messages: Array<Message>;
};

export const reservation = pgTable("Reservation", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  details: json("details").notNull(),
  hasCompletedPayment: boolean("hasCompletedPayment").notNull().default(false),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => user.id),
});

export type Reservation = InferSelectModel<typeof reservation>;

export const personalTask = pgTable("PersonalTask", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  title: varchar("title", { length: 256 }).notNull(),
  description: varchar("description", { length: 1024 }),
  status: varchar("status", { length: 64 }).notNull().default("pending"), // e.g., 'pending', 'done'
  reminder_at: timestamp("reminder_at"),
  is_dismissed: boolean("is_dismissed").notNull().default(false),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => user.id),
});

export type PersonalTask = InferSelectModel<typeof personalTask>;
export const globalSettings = pgTable("GlobalSettings", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  isBetaMode: boolean("isBetaMode").notNull().default(false),
  isDebugMode: boolean("isDebugMode").notNull().default(false),
  adminApiKey: varchar("admin_api_key", { length: 255 }),
  adminApiSecret: varchar("admin_api_secret", { length: 255 }),
  platformSyncSecret: varchar("platform_sync_secret", { length: 255 }),
});

export type GlobalSettings = InferSelectModel<typeof globalSettings>;
