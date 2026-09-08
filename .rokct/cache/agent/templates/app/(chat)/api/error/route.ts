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
          context: typeof context === "string" ? context : JSON.stringify(context || {}),
        },
      });
    } else {
      // Call Control site error logger
      const { OnboardingService } = await import("@/app/services/control/onboarding");
      // Since ControlBaseService is static, we call via ControlBaseService directly
      const { ControlBaseService } = await import("@/app/services/control/base");
      logRes = await ControlBaseService.call("control.api.log_frontend_error", {
        error_message: errorMessage,
        context: typeof context === "string" ? context : JSON.stringify(context || {}),
      });
    }

    return Response.json({ success: true, backend_result: logRes });
  } catch (error: any) {
    console.error("Failed to forward frontend error to backend:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
