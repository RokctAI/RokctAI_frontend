
import { getLead } from "@/app/actions/handson/all/crm/leads";
import { getTimeline } from "@/app/actions/handson/all/crm/timeline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityTimeline } from "@/components/handson/activity-timeline";
import Link from "next/link";
import { ArrowLeft, User, Building2, Mail, Phone, Calendar, Globe, MapPin, Clock } from "lucide-react";
import { notFound } from "next/navigation";

export default async function LeadMetrics({ params }: { params: { id: string } }) {
    const { id } = params;
    const [leadRes, timelineRes] = await Promise.all([
        getLead(id),
        getTimeline("CRM Lead", id)
    ]);
    const lead = leadRes.data;
    const timeline = timelineRes.data || [];

    if (!lead) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-red-500">Lead Not Found</h1>
                <Button asChild variant="link" className="pl-0 mt-4">
                    <Link href="/handson/all/crm/leads"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Leads</Link>
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
                    <Link href="/handson/all/crm/leads"><ArrowLeft className="w-4 h-4" /></Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">{lead.lead_name || lead.name}</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{lead.name}</span>
                        {lead.organization && <span>• {lead.organization}</span>}
                    </p>
                </div>
                <Badge variant={lead.status === "Converted" ? "default" : "secondary"} className="text-lg px-4 py-1">
                    {lead.status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Info Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Contact Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {lead.email_id && (
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <a href={`mailto:${lead.email_id} `} className="hover:underline">{lead.email_id}</a>
                                </div>
                            )}
                            {lead.mobile_no && (
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <a href={`tel:${lead.mobile_no} `} className="hover:underline">{lead.mobile_no}</a>
                                </div>
                            )}
                            {lead.website && (
                                <div className="flex items-center gap-3 p-3 border rounded-lg sm:col-span-2">
                                    <Globe className="w-4 h-4 text-muted-foreground" />
                                    <a href={lead.website} target="_blank" className="hover:underline">{lead.website}</a>
                                </div>
                            )}
                        </div>

                        {/* Notes / Description */}
                        {lead.notes && (
                            <div className="bg-muted/30 p-4 rounded-md">
                                <h3 className="font-semibold mb-2">Notes</h3>
                                <p className="whitespace-pre-wrap text-sm">{lead.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Owner Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Lead Owner</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>{getInitials(lead.lead_owner)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">{lead.lead_owner || "Unassigned"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">System Info</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Created On</span>
                                <span>{new Date(lead.creation).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Last Modified</span>
                                <span>{new Date(lead.modified).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Source</span>
                                <span>{lead.source || "Unknown"}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
