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
