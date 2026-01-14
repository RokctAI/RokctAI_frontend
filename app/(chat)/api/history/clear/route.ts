import { auth } from "@/app/(auth)/auth";
import { deleteAllChatsByUserId } from "@/db/queries";

export async function POST(request: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await deleteAllChatsByUserId({ userId: session.user.id });
    return new Response(null, { status: 204 }); // 204 No Content for successful deletion
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
