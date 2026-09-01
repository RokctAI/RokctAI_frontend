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
