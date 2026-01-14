
import { getDeal } from "@/app/actions/handson/all/crm/deals";
import { getTimeline } from "@/app/actions/handson/all/crm/timeline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityTimeline } from "@/components/handson/activity-timeline";
import Link from "next/link";
import { ArrowLeft, User, Building2, DollarSign, Percent, Calendar } from "lucide-react";
import { notFound } from "next/navigation";

export default async function DealDetails({ params }: { params: { id: string } }) {
    const { id } = params;
    const [dealRes, timelineRes] = await Promise.all([
        getDeal(params.id),
        getTimeline("CRM Deal", params.id)
    ]);
    const deal = dealRes.data;
    const timeline = timelineRes.data || [];

    if (!deal) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-red-500">Deal Not Found</h1>
                <Button asChild variant="link" className="pl-0 mt-4">
                    <Link href="/handson/all/crm/deals"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Deals</Link>
                </Button>
            </div>
        );
    }

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount || 0);
    };

    const getInitials = (name: string) => (name || "?").substring(0, 2).toUpperCase();

    return (
        <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon">
                    <Link href="/handson/all/crm/deals"><ArrowLeft className="w-4 h-4" /></Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">{deal.deal_name || deal.name}</h1>
                        <Badge variant={deal.status === "Won" ? "default" : (deal.status === "Lost" ? "destructive" : "secondary")} className="text-sm">
                            {deal.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{deal.name}</span>
                        {deal.organization && <span>• {deal.organization}</span>}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold">{formatCurrency(deal.annual_revenue, deal.currency)}</div>
                    <div className="text-sm text-muted-foreground">Value</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Info Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm flex items-center gap-3">
                                <Building2 className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Organization</div>
                                    <div className="font-semibold">{deal.organization || "-"}</div>
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm flex items-center gap-3">
                                <Percent className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Probability</div>
                                    <div className="font-semibold">{deal.probability || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* Description/Notes */}
                        {deal.description && (
                            <div className="bg-muted/30 p-4 rounded-md">
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="whitespace-pre-wrap text-sm">{deal.description}</p>
                            </div>
                        )}

                        {/* Lost Reason */}
                        {deal.status === 'Lost' && deal.lost_reason && (
                            <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20 text-destructive-foreground">
                                <h3 className="font-semibold mb-1">Lost Reason</h3>
                                <p>{deal.lost_reason}</p>
                            </div>
                        )}

                    </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Deal Owner */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Deal Owner</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={deal.deal_owner_image} alt={deal.deal_owner_name || deal.deal_owner} />
                                    <AvatarFallback>{getInitials(deal.deal_owner_name || deal.deal_owner)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">{deal.deal_owner || "Unassigned"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dates & System Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">System Info</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Close Date</span>
                                <span>{deal.expected_closing_date ? new Date(deal.expected_closing_date).toLocaleDateString() : "-"}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Created On</span>
                                <span>{new Date(deal.creation).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Last Modified</span>
                                <span>{new Date(deal.modified).toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>

            <ActivityTimeline items={timeline} />
        </div>
    );
}
