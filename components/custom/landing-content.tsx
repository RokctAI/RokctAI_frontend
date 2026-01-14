"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/custom/header";
import { Hero } from "@/components/custom/hero";
import { Pricing } from "@/components/custom/pricing";
import { useState } from "react";

export function LandingContent({ plans }: { plans: any[] }) {
    const router = useRouter();
    const [category, setCategory] = useState("rokct");

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header
                loginUrl="/login"
                signupUrl="/register"
            />
            <main className="flex-1">
                <Hero
                    signupUrl="/register"
                    selectedCategory={category}
                    onSelectCategory={setCategory}
                />
                <Pricing
                    signupUrl={(plan) => plan ? `/register?plan=${plan}` : '/register'}
                    category={category}
                    onCategoryChange={setCategory}
                    initialPlans={plans}
                />
            </main>
        </div>
    );
}
