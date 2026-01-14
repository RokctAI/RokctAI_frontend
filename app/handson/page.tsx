import { auth } from "@/auth";
import Link from "next/link";
import { RedirectType, redirect } from "next/navigation";

export default async function HandsOnMode() {
  const session = await auth();
  const userRole = (session?.user as any)?.roles?.[0];
  const isPaaS = (session?.user as any)?.isPaaS;

  // Same logic as Layout to determine primary destination
  const isControlUser = !isPaaS || ['System Manager', 'Administrator'].includes(userRole);

  if (isControlUser) {
    redirect("/handson/control", RedirectType.replace);
  } else {
    // For tenant, redirect to dashboard or settings
    redirect("/handson/tenant", RedirectType.replace);
  }

  return (
    <div className="flex flex-col items-center justify-center h-[50vh] p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
    </div>
  );
}
