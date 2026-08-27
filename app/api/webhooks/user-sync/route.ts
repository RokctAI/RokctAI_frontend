/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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

import { db } from "@/db";
import { user } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { globalSettings } from "@/db/schema";

export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // 1. Security Check - HMAC Verification
    let validSecret = process.env.PLATFORM_SYNC_SECRET;

    // Fetch from DB if available (preferred)
    const settings = await db.select().from(globalSettings).limit(1);
    if (settings.length > 0 && settings[0].platformSyncSecret) {
      validSecret = settings[0].platformSyncSecret;
    }

    if (!validSecret) {
      return NextResponse.json(
        { message: "Webhook secret not configured on server" },
        { status: 500 },
      );
    }

    const signature = request.headers.get("X-Rokct-Signature");
    if (!signature) {
      return NextResponse.json(
        { message: "Missing X-Rokct-Signature header" },
        { status: 401 },
      );
    }

    const rawBody = await request.text();
    const expectedSignature = crypto
      .createHmac("sha256", validSecret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { message: "Invalid payload signature" },
        { status: 401 },
      );
    }

    const body = JSON.parse(rawBody);
    const { event, email, site_name, first_name, last_name } = body;

    // Validation
    if (!email || !site_name || !event) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // 2. Handle "insert" or "update"
    if (event === "insert" || event === "update") {
      // Check for existing user
      const existingUsers = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);
      const existingUser = existingUsers[0];

      if (existingUser) {
        // Conflict Check: Same Email, Different Site
        // We block this to prevent login ambiguity (as discussed with User)
        if (existingUser.siteName && existingUser.siteName !== site_name) {
          return NextResponse.json(
            {
              message:
                "Email already exists on the platform for a different organization.",
              status: "conflict",
            },
            { status: 409 },
          );
        }

        // Same Site? Update Details (Idempotent)
        await db
          .update(user)
          .set({ siteName: site_name }) // Refresh site mapping just in case
          .where(eq(user.email, email));

        return NextResponse.json({
          message: "User synced (updated)",
          status: "success",
        });
      } else {
        // New User -> Insert
        await db.insert(user).values({
          email: email,
          siteName: site_name,
          // We don't have password/keys yet. The user will login via Frappe Auth.
        });

        return NextResponse.json({
          message: "User created",
          status: "success",
        });
      }
    }

    // 3. Handle "delete"
    if (event === "delete") {
      // Only delete if it matches BOTH email and site (Security prevention)
      await db
        .delete(user)
        .where(and(eq(user.email, email), eq(user.siteName, site_name)));
      return NextResponse.json({ message: "User deleted", status: "success" });
    }

    return NextResponse.json(
      { message: "Unknown event type" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
