
import { getDashboardStats } from "@/app/actions/handson/all/crm/dashboard";
import { DashboardChart } from "@/components/handson/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function DashboardPage() {
    const result = await getDashboardStats();
    const data = result.data || [];

    // Mock data if empty for visualization during development/if database is empty
    const displayData = data.length > 0 ? data : [
        {
            label: "Total Leads",
            chart_type: "metric",
            value: 124, // Ideally this comes from DB
            data: [{ name: "Total", value: 124 }]
        },
        {
            label: "Leads by Source",
            chart_type: "bar",
            data: [
                { name: "Website", value: 45 },
                { name: "Referral", value: 24 },
                { name: "Cold Call", value: 15 },
                { name: "Ads", value: 40 }
            ]
        },
        {
            label: "Pipeline Value",
            chart_type: "area",
            data: [
                { name: "Jan", value: 4000 },
                { name: "Feb", value: 3000 },
                { name: "Mar", value: 6000 },
                { name: "Apr", value: 8000 },
                { name: "May", value: 5000 },
                { name: "Jun", value: 9000 }
            ]
        },
        {
            label: "Deals by Status",
            chart_type: "pie",
            data: [
                { name: "Won", value: 12 },
                { name: "Lost", value: 5 },
                { name: "Negotiation", value: 8 },
                { name: "New", value: 15 }
            ]
        }
    ];

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">CRM Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your sales performance.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {displayData.map((item: any, idx: number) => (
                    <div key={idx} className={item.chart_type === 'metric' ? "col-span-1" : "col-span-1 md:col-span-2"}>
                        <DashboardChart
                            title={item.label || item.name}
                            type={item.chart_type || "bar"}
                            data={item.data || [{ name: "Value", value: item.value }]}
                            description={item.description}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
