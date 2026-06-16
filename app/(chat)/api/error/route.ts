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
