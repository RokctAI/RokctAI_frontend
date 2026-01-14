"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProspect, updateProspect, ProspectData } from "@/app/actions/handson/all/crm/prospects";
import { toast } from "sonner";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProspectFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export function ProspectForm({ initialData, isEdit = false }: ProspectFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Verified Fields
    const [companyName, setCompanyName] = useState(initialData?.company_name || "");
    const [industry, setIndustry] = useState(initialData?.industry || "");
    const [marketSegment, setMarketSegment] = useState(initialData?.market_segment || "");
    const [customerGroup, setCustomerGroup] = useState(initialData?.customer_group || "All Customer Groups");
    const [territory, setTerritory] = useState(initialData?.territory || "All Territories");
    const [employees, setEmployees] = useState(initialData?.no_of_employees || "");
    const [annualRevenue, setAnnualRevenue] = useState(initialData?.annual_revenue || "");
    const [website, setWebsite] = useState(initialData?.website || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!companyName) {
            toast.error("Company Name is required");
            return;
        }

        setLoading(true);

        const payload: ProspectData = {
            company_name: companyName,
            industry,
            market_segment: marketSegment,
            customer_group: customerGroup,
            territory,
            no_of_employees: employees,
            annual_revenue: annualRevenue ? parseFloat(annualRevenue) : 0,
            website,
            // company: "Juvo" // Ideally fetched from context, ensuring it's present for verification
        };

        let result;
        if (isEdit) {
            result = await updateProspect(initialData.name, payload);
        } else {
            result = await createProspect(payload);
        }

        setLoading(false);

        if (result.success) {
            toast.success(isEdit ? "Prospect updated" : "Prospect created");
            router.push("/handson/all/commercial/crm/prospects");
            router.refresh();
        } else {
            toast.error("Failed: " + result.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/handson/all/commercial/crm/prospects">
                        <Button variant="outline" size="icon" type="button">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{isEdit ? `Edit Prospect: ${initialData.company_name}` : "New Prospect"}</h1>
                </div>
                <Button type="submit" disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Saving..." : "Save"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name *</Label>
                            <Input
                                id="companyName"
                                placeholder="e.g. Wayne Enterprises"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                placeholder="https://..."
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customerGroup">Customer Group</Label>
                            <Input
                                id="customerGroup"
                                value={customerGroup}
                                onChange={(e) => setCustomerGroup(e.target.value)}
                                placeholder="e.g. Commercial"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="territory">Territory</Label>
                            <Input
                                id="territory"
                                value={territory}
                                onChange={(e) => setTerritory(e.target.value)}
                                placeholder="e.g. South Africa"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Market Data</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Input
                                id="industry"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                placeholder="e.g. Tech"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="marketSegment">Market Segment</Label>
                            <Input
                                id="marketSegment"
                                value={marketSegment}
                                onChange={(e) => setMarketSegment(e.target.value)}
                                placeholder="e.g. Enterprise"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="employees">No. of Employees</Label>
                            <Select value={employees} onValueChange={setEmployees}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1-10">1-10</SelectItem>
                                    <SelectItem value="11-50">11-50</SelectItem>
                                    <SelectItem value="51-200">51-200</SelectItem>
                                    <SelectItem value="201-500">201-500</SelectItem>
                                    <SelectItem value="501-1000">501-1000</SelectItem>
                                    <SelectItem value="1000+">1000+</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="revenue">Annual Revenue</Label>
                            <Input
                                id="revenue"
                                type="number"
                                value={annualRevenue}
                                onChange={(e) => setAnnualRevenue(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </form>
    );
}
