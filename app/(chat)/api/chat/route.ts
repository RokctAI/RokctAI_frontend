import { auth } from "@/app/(auth)/auth";
import { saveChat, getChatById, deleteChatById } from "@/db/queries";

export async function POST(request: Request) {
  const { id, messages } = await request.json();
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Filter messages to get only non-empty ones
  const coreMessages = messages.filter((m: any) => m.content && m.content.length > 0);
  const userMessage = coreMessages[coreMessages.length - 1]?.content || "";

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  // Resolve base domain and call appropriate VPS chat bridge
  const isBusiness = !!session.user.siteName;
  let responseMessage = "";

  try {
    let chatRes;
    if (isBusiness) {
      const { OnboardingService } = await import("@/app/services/tenant/onboarding");
      chatRes = await OnboardingService.chatWithRok(userMessage, id);
    } else {
      const { OnboardingService } = await import("@/app/services/control/onboarding");
      chatRes = await OnboardingService.chatWithRok(userMessage, id);
    }

    if (chatRes && chatRes.message) {
      responseMessage = chatRes.message;
    } else {
      responseMessage = chatRes?.error || "I encountered an error connecting to ROK.";
    }
  } catch (e) {
    console.error("ROK Chat failed:", e);
    responseMessage = "Failed to communicate with ROK on the remote VPS.";
  }

  // Save the chat locally for web history persistence
  try {
    await saveChat({
      id,
      messages: [
        ...coreMessages,
        { role: "assistant", content: responseMessage }
      ],
      userId: session.user.id,
    });
  } catch (error) {
    console.error("Failed to save chat locally:", error);
  }

  // Return standard Vercel AI SDK Data Stream Protocol response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const chunks = responseMessage.split(/(\s+)/);
      for (const chunk of chunks) {
        const payload = `0:${JSON.stringify(chunk)}\n`;
        controller.enqueue(encoder.encode(payload));
        await new Promise((resolve) => setTimeout(resolve, 15)); // Smooth typing simulation
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    }
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });
    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
