"use server";

import { auth } from "@/auth";

export async function getSessionCurrency() {
    const session = await auth();
    return (session?.user as any)?.company?.currency || "USD";
}
