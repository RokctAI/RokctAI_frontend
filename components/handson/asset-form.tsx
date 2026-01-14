"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAsset } from "@/app/actions/handson/all/accounting/assets/createAsset";
import { updateAsset } from "@/app/actions/handson/all/accounting/assets/updateAsset";
import { AssetData } from "@/app/actions/handson/all/accounting/assets/types";
import { getCompanies } from "@/app/actions/handson/all/hrms/companies";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AssetFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export function AssetForm({ initialData, isEdit = false }: AssetFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [assetName, setAssetName] = useState(initialData?.asset_name || "");
    const [itemCode, setItemCode] = useState(initialData?.item_code || "");
    const [purchaseAmount, setPurchaseAmount] = useState<string | number>(initialData?.gross_purchase_amount || "");
    const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(
        initialData?.purchase_date ? new Date(initialData.purchase_date) : undefined
    );
    const [location, setLocation] = useState(initialData?.location || "Head Office");
    const [status, setStatus] = useState(initialData?.status || "Draft");
    const [company, setCompany] = useState(initialData?.company || "Juvo");

    const [companies, setCompanies] = useState<any[]>([]);

    useEffect(() => {
        getCompanies().then(c => {
            setCompanies(c);
            if (c.length > 0 && !initialData?.company) setCompany(c[0].name);
        });
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!assetName || !itemCode) {
            toast.error("Asset Name and Item Code are required");
            return;
        }
        if (!company) {
            toast.error("Company is required");
            return;
        }

        setLoading(true);

        const payload: AssetData = {
            asset_name: assetName,
            item_code: itemCode,
            gross_purchase_amount: Number(purchaseAmount),
            purchase_date: purchaseDate ? format(purchaseDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            company: company,
            location: location,
            status: status
        };

        let result;
        if (isEdit) {
            result = await updateAsset(initialData.name, payload);
        } else {
            result = await createAsset(payload);
        }

        setLoading(false);

        if (result.success) {
            toast.success(isEdit ? "Asset updated" : "Asset created");
            router.push("/handson/all/financials/assets");
            router.refresh();
        } else {
            toast.error("Failed: " + result.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/handson/all/financials/assets">
                        <Button variant="outline" size="icon" type="button">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{isEdit ? `Edit Asset: ${initialData.name}` : "New Asset"}</h1>
                </div>
                <Button type="submit" disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Saving..." : "Save"}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Asset Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="assetName">Asset Name</Label>
                        <Input
                            id="assetName"
                            placeholder="e.g. MacBook Pro M1"
                            value={assetName}
                            onChange={(e) => setAssetName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="itemCode">Item Code</Label>
                        <Input
                            id="itemCode"
                            placeholder="e.g. ITEM-001 (Must link to an Item)"
                            value={itemCode}
                            onChange={(e) => setItemCode(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Company</Label>
                        <Select value={company} onValueChange={setCompany} disabled={isEdit}>
                            <SelectTrigger><SelectValue placeholder="Select Company" /></SelectTrigger>
                            <SelectContent>
                                {companies.map(c => <SelectItem key={c.name} value={c.name}>{c.company_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Purchase Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !purchaseDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {purchaseDate ? format(purchaseDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={purchaseDate}
                                        onSelect={setPurchaseDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="purchaseAmount">Gross Purchase Amount</Label>
                            <Input
                                id="purchaseAmount"
                                type="number"
                                step="0.01"
                                value={purchaseAmount}
                                onChange={(e) => setPurchaseAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Server Room"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Submitted">Submitted</SelectItem>
                                    <SelectItem value="Sold">Sold</SelectItem>
                                    <SelectItem value="Scrapped">Scrapped</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
