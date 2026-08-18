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

export const revalidate = 0;

export async function POST(request: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { errorMessage, context } = await request.json();

    const isBusiness = !!session.user.siteName;
    let logRes;

    if (isBusiness) {
      // Call Tenant site error logger
      const { getClient } = await import("@/app/lib/client");
      const client = await getClient();
      logRes = await (client as any).call({
        method: "rcore.tenant.api.log_frontend_error",
        args: {
          error_message: errorMessage,
          context:
            typeof context === "string"
              ? context
              : JSON.stringify(context || {}),
        },
      });
    } else {
      // Call Control site error logger
      const { OnboardingService } =
        await import("@/app/services/control/onboarding");
      // Since ControlBaseService is static, we call via ControlBaseService directly
      const { ControlBaseService } =
        await import("@/app/services/control/base");
      logRes = await ControlBaseService.call("control.api.log_frontend_error", {
        error_message: errorMessage,
        context:
          typeof context === "string" ? context : JSON.stringify(context || {}),
      });
    }

    return Response.json({ success: true, backend_result: logRes });
  } catch (error: any) {
    console.error("Failed to forward frontend error to backend:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
