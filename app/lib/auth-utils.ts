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

import { auth } from "@/app/(auth)/auth";
import { refreshTokens } from "@/app/(auth)/actions";

export async function getAuthenticatedTokens() {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const user = session.user as any;

  // Check if tokens are expired or nearing expiry
  if (user.tokenExpiry) {
    const now = new Date();
    const expiry = new Date(user.tokenExpiry);

    // Refresh if expired or expires in less than 5 minutes
    if (now > expiry || expiry.getTime() - now.getTime() < 300000) {
      console.log(
        `[Auth] Tokens expired or nearing expiry. Triggering refresh...`,
      );
      const refreshRes = await refreshTokens();
      if (!refreshRes.success) {
        throw new Error("Session expired. Please login again.");
      }
      // Note: The new tokens will be available in the next session request
      // but for the current call, we might need to use the new ones if returned.
    }
  }

  return {
    apiKey: user.apiKey,
    apiSecret: user.apiSecret,
    siteName: user.siteName,
  };
}
