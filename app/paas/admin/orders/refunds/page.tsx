"use client";

import { Loader2, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getRefunds, updateRefund } from "@/app/actions/paas/admin/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminRefundsPage() {
    const [refunds, setRefunds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRefunds();
    }, []);

    async function fetchRefunds() {
        try {
            const data = await getRefunds();
            setRefunds(data);
        } catch (error) {
            console.error("Error fetching refunds:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleUpdate = async (name: string, status: string) => {
        try {
            await updateRefund(name, status);
            toast.success(`Refund request ${status.toLowerCase()}`);
            fetchRefunds();
        } catch (error) {
            toast.error("Failed to update refund status");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Refund Requests</h1>

            <div className="grid gap-4">
                {refunds.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No refund requests found.</div>
                ) : (
                    refunds.map((refund) => (
                        <Card key={refund.name}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    Order #{refund.order}
                                </CardTitle>
                                <Badge variant={
                                    refund.status === "Accepted" ? "default" :
                                        refund.status === "Canceled" ? "destructive" : "secondary"
                                }>
                                    {refund.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-sm">
                                        <span className="font-semibold">Reason:</span> {refund.cause}
                                    </div>
                                    {refund.answer && (
                                        <div className="text-sm text-muted-foreground">
                                            <span className="font-semibold">Response:</span> {refund.answer}
                                        </div>
                                    )}
                                    {refund.status === "Pending" && (
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-500 hover:text-red-600"
                                                onClick={() => handleUpdate(refund.name, "Canceled")}
                                            >
                                                <X className="mr-2 size-4" />
                                                Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdate(refund.name, "Accepted")}
                                            >
                                                <Check className="mr-2 size-4" />
                                                Approve
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
