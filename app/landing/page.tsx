import { getSubscriptionPlans } from "@/lib/actions/getSubscriptionPlans";
import { LandingContent } from "@/components/custom/landing-content";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
    let plans: any[] = [];

    try {
        const response = await getSubscriptionPlans();
        if (response.success && response.data) {
            plans = response.data;
        }
    } catch (e) {
        console.error("Prefetch error:", e);
    }

    return <LandingContent plans={plans} />;
}
