"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateNamingSeries } from "@/app/actions/handson/all/settings/general";
import { Loader2 } from "lucide-react";

const DOC_SERIES_OPTIONS = [
    { label: "Purchase Order", value: "PO-", doctype: "Purchase Order" },
    { label: "Quotation", value: "QTN-", doctype: "Quotation" },
    { label: "Sales Invoice", value: "SINV-", doctype: "Sales Invoice" },
    { label: "Project", value: "PROJ-", doctype: "Project" },
];

function getDefaultPrefix(doctype: string) {
    if (doctype === "Purchase Order") return "PO-.YYYY.-";
    if (doctype === "Quotation") return "QTN-.YYYY.-";
    if (doctype === "Sales Invoice") return "ACC-SINV-.YYYY.-";
    if (doctype === "Project") return "PROJ-.####";
    return "";
}

export function NamingSeriesForm({ doctype }: { doctype?: string }) {
    const [loading, setLoading] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(doctype || "");
    const [prefix, setPrefix] = useState(doctype ? getDefaultPrefix(doctype) : "");
    const [currentNumber, setCurrentNumber] = useState("");

    const handleDocChange = (val: string) => {
        setSelectedDoc(val);
        setPrefix(getDefaultPrefix(val));
    };

    const handleUpdate = async () => {
        if (!prefix || !currentNumber) {
            toast.error("Prefix and Current Number are required");
            return;
        }

        setLoading(true);
        try {
            const result = await updateNamingSeries(prefix, parseInt(currentNumber));
            if (result && result.success) {
                toast.success(result.message);
                setCurrentNumber("");
            } else {
                toast.error(result?.error || "Failed to update series");
            }
        } catch (e) {
            toast.error("An unexpected error occurred");
        }
        setLoading(false);
    };

    const formContent = (
        <div className="space-y-4">
            {!doctype && (
                <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select onValueChange={handleDocChange} value={selectedDoc}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Document" />
                        </SelectTrigger>
                        <SelectContent>
                            {DOC_SERIES_OPTIONS.map((opt) => (
                                <SelectItem key={opt.doctype} value={opt.doctype}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="space-y-2">
                <Label>Series Prefix</Label>
                <Input
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="e.g. INV-.YYYY.-"
                />
                {!doctype && (
                    <p className="text-xs text-muted-foreground">
                        Enter the exact series prefix used in ERPNext (e.g. ACC-SINV-.YYYY.-)
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label>Current Number</Label>
                <Input
                    type="number"
                    value={currentNumber}
                    onChange={(e) => setCurrentNumber(e.target.value)}
                    placeholder="e.g. 100"
                />
                <p className="text-xs text-muted-foreground">
                    The next document will be Current Number + 1.
                </p>
            </div>

            <Button onClick={handleUpdate} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Series
            </Button>
        </div>
    );

    if (doctype) {
        return formContent;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Document Numbering</CardTitle>
                <CardDescription>
                    Set the starting number for your documents.
                    Warning: Changing this affects all future documents of this type.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {formContent}
            </CardContent>
        </Card>
    );
}
