"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createLead, updateLead, LeadData } from "@/app/actions/handson/all/crm/leads";
import { toast } from "sonner";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeadFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export function LeadForm({ initialData, isEdit = false }: LeadFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [leadName, setLeadName] = useState(initialData?.lead_name || "");
    const [companyName, setCompanyName] = useState(initialData?.company_name || "");
    const [email, setEmail] = useState(initialData?.email_id || "");
    const [mobile, setMobile] = useState(initialData?.mobile_no || "");
    const [status, setStatus] = useState(initialData?.status || "Lead");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!leadName) {
            toast.error("Lead Name is required");
            return;
        }

        setLoading(true);

        const payload: LeadData = {
            lead_name: leadName,
            company_name: companyName,
            email_id: email,
            mobile_no: mobile,
            status: status
        };

        let result;
        if (isEdit) {
            result = await updateLead(initialData.name, payload);
        } else {
            result = await createLead(payload);
        }

        setLoading(false);

        if (result.success) {
            toast.success(isEdit ? "Lead updated" : "Lead created");
            router.push("/handson/all/commercial/crm/leads");
            router.refresh();
        } else {
            toast.error("Failed: " + result.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/handson/all/commercial/crm/leads">
                        <Button variant="outline" size="icon" type="button">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{isEdit ? `Edit Lead: ${initialData.lead_name}` : "New Lead"}</h1>
                </div>
                <Button type="submit" disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Saving..." : "Save"}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lead Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="leadName">Lead Name (Person)</Label>
                        <Input
                            id="leadName"
                            placeholder="e.g. John Doe"
                            value={leadName}
                            onChange={(e) => setLeadName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name (Optional)</Label>
                        <Input
                            id="companyName"
                            placeholder="e.g. Acme Corp"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile</Label>
                            <Input
                                id="mobile"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Lead">Lead</SelectItem>
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="Replied">Replied</SelectItem>
                                <SelectItem value="Opportunity">Opportunity</SelectItem>
                                <SelectItem value="Quotation">Quotation</SelectItem>
                                <SelectItem value="Lost">Lost</SelectItem>
                                <SelectItem value="Interested">Interested</SelectItem>
                                <SelectItem value="Converted">Converted</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
