"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { login } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Branding } from "@/components/custom/branding";
import React from "react";

export function PaaSLogin() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const siteName = searchParams.get('site_name');

    const [email, setEmail] = useState("");
    const [isSuccessful, setIsSuccessful] = useState(false);

    const [state, formAction] = useActionState(login, undefined);

    useEffect(() => {
        if (!siteName) {
            router.push("/landing");
        }
    }, [siteName, router]);

    useEffect(() => {
        if (state?.status === "success") {
            setIsSuccessful(true);
            router.refresh();
        } else if (state?.status === "failed") {
            toast.error("Login Failed", {
                description: state.message,
            });
        }
    }, [state, router]);

    const handleSubmit = (formData: FormData) => {
        setEmail(formData.get("email") as string);
        if (siteName) {
            formData.append('site_name', siteName);
        }
        // Flag this as a PaaS login attempt
        formData.append('is_paas', 'true');
        formAction(formData);
    };

    if (!siteName) {
        return null; // Don't render anything while redirecting
    }

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            <main className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-lg border border-gray-800">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tighter italic">
                            Login to <Branding />
                        </h1>
                        <p className="text-gray-400">
                            Enter your credentials to access your dashboard.
                        </p>
                    </div>

                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                className="bg-gray-800 border-gray-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-gray-800 border-gray-700 text-white"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-white text-black hover:bg-gray-200"
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="text-center text-sm text-gray-500">
                        Logging in to tenant: <span className="text-white font-mono">{siteName}</span>
                    </div>
                </div>
            </main>
            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-800">
                <p className="text-xs text-gray-500">© 2025 {PLATFORM_NAME}. All rights reserved.</p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-xs hover:underline underline-offset-4 text-gray-500" href="#">
                        Terms of Service
                    </Link>
                    <Link className="text-xs hover:underline underline-offset-4 text-gray-500" href="#">
                        Privacy
                    </Link>
                </nav>
            </footer>
        </div>
    );
}
