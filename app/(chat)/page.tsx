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
  const id = generateUUID();

  if (!session || !session.user) {
    const params = await searchParams;
    const siteName = params?.site_name;

    if (!siteName) {
      redirect("/landing");
    }

    return <PaaSLogin />;
  }

  const isPaidUser =
    !session?.user?.is_free_plan &&
    (session?.user?.status === "Active" || session?.user?.status === "Trialing");

  return <Chat id={id} initialMessages={[]} isPaidUser={isPaidUser} />;
}
