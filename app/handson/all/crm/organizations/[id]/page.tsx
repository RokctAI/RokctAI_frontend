
import { getOrganization } from "@/app/actions/handson/all/crm/organizations";
import { getTimeline } from "@/app/actions/handson/all/crm/timeline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityTimeline } from "@/components/handson/activity-timeline";
import Link from "next/link";
import { ArrowLeft, Globe, Building, MapPin, Calendar, Briefcase } from "lucide-react";
import { notFound } from "next/navigation";

export default async function OrganizationDetails({ params }: { params: { id: string } }) {
    const { id } = params;
    const [orgRes, timelineRes] = await Promise.all([
        getOrganization(id),
        getTimeline("CRM Organization", id)
    ]);
    const org = orgRes.data;
    const timeline = timelineRes.data || [];

    if (!org) {
        notFound();
    }

    const getInitials = (name: string) => (name || "?").substring(0, 2).toUpperCase();

    return (
        <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon">
                    <Link href="/handson/all/crm/organizations"><ArrowLeft className="w-4 h-4" /></Link>
                </Button>
                <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-16 h-16 border bg-white">
                        <AvatarImage src={org.organization_logo} />
                        <AvatarFallback className="text-xl">{getInitials(org.organization_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{org.organization_name}</h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Info Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Links */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            {org.website && (
                                <div className="flex items-center gap-3 p-3 border rounded-lg flex-1">
                                    <Globe className="w-4 h-4 text-muted-foreground" />
                                    <a href={org.website} target="_blank" className="hover:underline">{org.website}</a>
                                </div>
                            )}
                            {org.industry && (
                                <div className="flex items-center gap-3 p-3 border rounded-lg flex-1">
                                    <Building className="w-4 h-4 text-muted-foreground" />
                                    <span>{org.industry}</span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {org.description && (
                            <div className="bg-muted/30 p-4 rounded-md">
                                <h3 className="font-semibold mb-2">About</h3>
                                <p className="whitespace-pre-wrap text-sm">{org.description}</p>
                            </div>
                        )}

                        {/* Address (Simplified View) */}
                        {org.primary_address && (
                            <div className="p-4 border rounded-md">
                                <div className="flex items-center gap-2 mb-2 font-medium">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span>Primary Address</span>
                                </div>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{org.primary_address}</p>
                            </div>
                        )}

                    </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* System Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">System Info</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Created On</span>
                                <span>{new Date(org.creation).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Last Modified</span>
                                <span>{new Date(org.modified).toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
