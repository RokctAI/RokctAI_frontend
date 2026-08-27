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

"use server";

import { auth } from "@/app/(auth)/auth";
import { ClientPortalService } from "@/app/services/portal/client";
import { revalidatePath } from "next/cache";

export async function getClientSubscriptions() {
  const session = await auth();
  if (!session?.user?.email) {
    return { message: "Not logged in" };
  }

  const userEmail = session.user.email;

  try {
    // 1. Get User
    const user = await ClientPortalService.getUserByEmail(userEmail);
    if (!user) {
      return { message: "User not found" };
    }

    // 2. Get Telephony Customer & Subscriptions
    const telCustomer = await ClientPortalService.getTelephonyCustomer(
      user.name,
    );
    let telephonySubs: any[] = [];
    let balance = 0;

    if (telCustomer) {
      telephonySubs = await ClientPortalService.getTelephonySubscriptions(
        telCustomer.name,
      );
      balance = telCustomer.balance;
    }

    // 3. Get Hosting Subscriptions
    const hostingSubs =
      await ClientPortalService.getHostingSubscriptions(userEmail);

    return {
      telephony: telephonySubs,
      hosting: hostingSubs,
      balance: balance,
    };
  } catch (error: any) {
    console.error("Error fetching client subscriptions:", error);
    return { message: "Failed to fetch subscriptions" };
  }
}
