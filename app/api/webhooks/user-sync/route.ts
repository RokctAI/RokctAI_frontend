import { db } from "@/db";
import { user } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { globalSettings } from "@/db/schema";

export async function POST(request: NextRequest) {
    try {
        // 1. Security Check
        let validSecret = process.env.PLATFORM_SYNC_SECRET;

        // Fetch from DB if available (preferred)
        const settings = await db.select().from(globalSettings).limit(1);
        if (settings.length > 0 && settings[0].platformSyncSecret) {
            validSecret = settings[0].platformSyncSecret;
        }

        const secret = request.headers.get("X-Rokct-Webhook-Secret");
        if (!validSecret || secret !== validSecret) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { event, email, site_name, first_name, last_name } = body;

        // Validation
        if (!email || !site_name || !event) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // 2. Handle "insert" or "update"
        if (event === "insert" || event === "update") {
            // Check for existing user
            const existingUsers = await db.select().from(user).where(eq(user.email, email)).limit(1);
            const existingUser = existingUsers[0];

            if (existingUser) {
                // Conflict Check: Same Email, Different Site
                // We block this to prevent login ambiguity (as discussed with User)
                if (existingUser.siteName && existingUser.siteName !== site_name) {
                    return NextResponse.json(
                        {
                            message: "Email already exists on the platform for a different organization.",
                            status: "conflict"
                        },
                        { status: 409 }
                    );
                }

                // Same Site? Update Details (Idempotent)
                await db.update(user)
                    .set({ siteName: site_name }) // Refresh site mapping just in case
                    .where(eq(user.email, email));

                return NextResponse.json({ message: "User synced (updated)", status: "success" });
            } else {
                // New User -> Insert
                await db.insert(user).values({
                    email: email,
                    siteName: site_name,
                    // We don't have password/keys yet. The user will login via Frappe Auth.
                });

                return NextResponse.json({ message: "User created", status: "success" });
            }
        }

        // 3. Handle "delete"
        if (event === "delete") {
            // Only delete if it matches BOTH email and site (Security prevention)
            await db.delete(user).where(
                and(
                    eq(user.email, email),
                    eq(user.siteName, site_name)
                )
            );
            return NextResponse.json({ message: "User deleted", status: "success" });
        }

        return NextResponse.json({ message: "Unknown event type" }, { status: 400 });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
