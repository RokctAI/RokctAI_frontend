
import { getContact } from "@/app/actions/handson/all/crm/contacts";
import { getTimeline } from "@/app/actions/handson/all/crm/timeline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActivityTimeline } from "@/components/handson/activity-timeline";
import { ArrowLeft, Building2, UserCircle, Briefcase, Mail, Phone, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ContactDetails({ params }: { params: { id: string } }) {
    const [contactRes, timelineRes] = await Promise.all([
        getContact(params.id),
        getTimeline("Contact", params.id)
    ]);
    const contact = contactRes.data;
    const timeline = timelineRes.data || [];

    if (!contact) {
        notFound();
    }

    const getInitials = (name: string) => (name || "?").substring(0, 2).toUpperCase();

    return (
        <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon">
                    <Link href="/handson/all/crm/contacts"><ArrowLeft className="w-4 h-4" /></Link>
                </Button>
                <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-16 h-16 border bg-white">
                        <AvatarImage src={contact.image} />
                        <AvatarFallback className="text-xl">{getInitials(contact.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            {contact.salutation ? `${contact.salutation} ` : ''} {contact.full_name || contact.name}
                            <Badge variant="outline" className="text-sm font-normal">{contact.status}</Badge>
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <UserCircle className="w-4 h-4" />
                            <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{contact.name}</span>
                        </p>
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
                        {/* Contact Methods */}
                        <div className="flex flex-col gap-4">
                            {contact.email_id && (
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <a href={`mailto:${contact.email_id} `} className="hover:underline">{contact.email_id}</a>
                                </div>
                            )}
                            {contact.mobile_no && (
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <a href={`tel:${contact.mobile_no} `} className="hover:underline">{contact.mobile_no}</a>
                                </div>
                            )}
                        </div>

                        {/* Organization Link */}
                        {contact.company_name && (
                            <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-lg">
                                <Building2 className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Organization</div>
                                    <div className="font-medium text-lg">{contact.company_name}</div>
                                </div>
                            </div>
                        )}

                        {/* Designation / Job Title */}
                        {contact.designation && (
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-4 h-4 text-muted-foreground" />
                                <span>{contact.designation}</span>
                                {contact.department && <span className="text-muted-foreground">({contact.department})</span>}
                            </div>
                        )}

                        {/* Gender */}
                        {contact.gender && (
                            <div className="flex items-center gap-3">
                                <UserCircle className="w-4 h-4 text-muted-foreground" />
                                <span>{contact.gender}</span>
                            </div>
                        )}

                        {/* Date of Birth */}
                        {contact.date_of_birth && (
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{new Date(contact.date_of_birth).toLocaleDateString()}</span>
                            </div>
                        )}

                        {/* Address */}
                        {(contact.address_line1 || contact.city || contact.state || contact.pincode || contact.country) && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                                <div className="flex flex-col">
                                    {contact.address_line1 && <span>{contact.address_line1}</span>}
                                    {(contact.city || contact.state || contact.pincode) && (
                                        <span>
                                            {contact.city}{contact.city && (contact.state || contact.pincode) ? ", " : ""}
                                            {contact.state}{contact.state && contact.pincode ? " " : ""}
                                            {contact.pincode}
                                        </span>
                                    )}
                                    {contact.country && <span>{contact.country}</span>}
                                </div>
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
                                <span>{new Date(contact.creation).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Last Modified</span>
                                <span>{new Date(contact.modified).toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <ActivityTimeline items={timeline} />
                </div>

            </div>
        </div>
    );
}
