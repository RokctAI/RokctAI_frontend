"use client";

import { useState } from "react";
import { updateAiMyProfile } from "@/app/actions/ai/hr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck, CheckCircle, AlertCircle } from "lucide-react";

interface ProfileFormCardProps {
    initialData?: {
        id_number?: string;
        bank_name?: string;
        bank_account_no?: string;
        bank_branch_code?: string;
        tax_id?: string;
    };
    onCallback?: (result: any) => void;
}

export function ProfileFormCard({ initialData, onCallback }: ProfileFormCardProps) {
    const [formData, setFormData] = useState({
        id_number: initialData?.id_number || "",
        bank_name: initialData?.bank_name || "",
        bank_account_no: initialData?.bank_account_no || "",
        bank_branch_code: initialData?.bank_branch_code || "",
        tax_id: initialData?.tax_id || ""
    });
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");

        const result = await updateAiMyProfile(formData as any);

        if (result.success) {
            setStatus("success");
            setMessage("Profile updated successfully.");
            if (onCallback) onCallback(result);
        } else {
            setStatus("error");
            setMessage(result.error || "Failed to update profile.");
        }
    };

    if (status === "success") {
        return (
            <Card className="w-full max-w-md bg-purple-50/50 border-purple-200 backdrop-blur-sm">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                    <CheckCircle className="h-12 w-12 text-purple-500 mb-2" />
                    <h3 className="font-semibold text-purple-800 text-sm">Profile Updated</h3>
                    <p className="text-xs text-purple-700">Your verification details have been saved.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md shadow-lg glass-card border-purple-500/20">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <ShieldCheck className="h-4 w-4 text-purple-500" />
                    Bank-Level Verification
                </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-3 pb-4">
                    <div className="space-y-1">
                        <Label htmlFor="id_number" className="text-[10px] uppercase tracking-wider text-muted-foreground">SA ID Number</Label>
                        <Input
                            id="id_number"
                            value={formData.id_number}
                            onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                            placeholder="13-digit checksum validated"
                            className="h-8 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="bank_name" className="text-[10px] uppercase tracking-wider text-muted-foreground">Bank Name</Label>
                            <Input
                                id="bank_name"
                                value={formData.bank_name}
                                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                placeholder="e.g. FNB"
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="tax_id" className="text-[10px] uppercase tracking-wider text-muted-foreground">Tax ID (SARS)</Label>
                            <Input
                                id="tax_id"
                                value={formData.tax_id}
                                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                                placeholder="SARS Ref"
                                className="h-8 text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="bank_account_no" className="text-[10px] uppercase tracking-wider text-muted-foreground">Account Number</Label>
                            <Input
                                id="bank_account_no"
                                value={formData.bank_account_no}
                                onChange={(e) => setFormData({ ...formData, bank_account_no: e.target.value })}
                                placeholder="Digits only"
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="bank_branch_code" className="text-[10px] uppercase tracking-wider text-muted-foreground">Branch Code</Label>
                            <Input
                                id="bank_branch_code"
                                value={formData.bank_branch_code}
                                onChange={(e) => setFormData({ ...formData, bank_branch_code: e.target.value })}
                                placeholder="6 digits"
                                className="h-8 text-sm"
                            />
                        </div>
                    </div>

                    {status === "error" && (
                        <div className="text-[10px] text-red-500 bg-red-50 p-2 rounded flex items-center gap-2">
                            <AlertCircle className="h-3 w-3" /> {message}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="pt-0">
                    <Button type="submit" className="w-full h-8 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white" disabled={status === "submitting"}>
                        {status === "submitting" && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                        Save Verification Details
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
