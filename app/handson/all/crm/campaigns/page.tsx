import { getEmailCampaigns } from "@/app/actions/handson/all/crm/campaigns";

export default async function CampaignsPage() {
    const { data: campaigns } = await getEmailCampaigns();

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Email Campaigns</h1>
                    <p className="text-muted-foreground">Manage automated email sequences.</p>
                </div>
            </div>

            <div className="border rounded-lg p-4">
                <pre className="text-xs">{JSON.stringify(campaigns, null, 2)}</pre>
            </div>
        </div>
    );
}
