import { auth } from "@/app/(auth)/auth";

export const revalidate = 0;

export async function POST(request: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { sessionId, messages } = await request.json();

    if (!sessionId || !messages || !Array.isArray(messages)) {
      return new Response("Invalid request arguments", { status: 400 });
    }

    const isBusiness = !!session.user.siteName;
    let sumRes;

    if (isBusiness) {
      // Call Tenant site summarization
      const { getClient } = await import("@/app/lib/client");
      const client = await getClient();
      sumRes = await (client as any).call({
        method: "rcore.api.plan_builder.summarize_chat_session",
        args: {
          session_id: sessionId,
          messages: JSON.stringify(messages),
        },
      });
    } else {
      // Call Control site summarization
      const { ControlBaseService } = await import("@/app/services/control/base");
      sumRes = await ControlBaseService.call("control.api.summarize_chat_session", {
        session_id: sessionId,
        messages: JSON.stringify(messages),
      });
    }

    return Response.json({ success: true, summary: sumRes?.summary || sumRes });
  } catch (error: any) {
    console.error("Failed to summarize chat session:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
