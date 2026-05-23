import { redirect } from "next/navigation";
import { getCurrentSession } from "@/app/(auth)/actions";
import { Chat } from "@/components/custom/chat";
import { PaaSLogin } from "@/components/custom/paas-login";
import { generateUUID } from "@/lib/utils";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getCurrentSession();

  if (!session || !session.user) {
    const params = await searchParams;
    const siteName = params?.site_name;

    if (!siteName) {
      redirect("/landing");
    }

    return <PaaSLogin />;
  }

  // Auto-route to the latest active chat session if one exists in database
  try {
    if (session.user.id) {
      const { getChatsByUserId } = await import("@/db/queries");
      const chats = await getChatsByUserId({ id: session.user.id });
      if (chats && chats.length > 0) {
        redirect(`/chat/${chats[0].id}`);
      }
    }
  } catch (e) {
    console.error("Failed to query latest chat session, fallback to new session:", e);
  }

  const id = generateUUID();

  const isPaidUser =
    !session?.user?.is_free_plan &&
    (session?.user?.status === "Active" ||
      session?.user?.status === "Trialing");

  return <Chat id={id} initialMessages={[]} isPaidUser={isPaidUser} />;
}
