"use server";

import { auth } from "@/auth";

export async function getSessionCompanyContext() {
    const session = await auth();
    return session?.user?.company || {
        name: "",
        companyName: "",
        country: "",
        countryCode: "",
        currency: "ZAR"
    };
}
