"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Ban, Copy, CheckCircle, AlertOctagon } from "lucide-react";
import { auth } from "@/auth";
import { getSessionCurrency } from "@/app/actions/currency"; // New import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPayment } from "@/app/actions/handson/all/accounting/payments/getPayment";
import { cancelPayment } from "@/app/actions/handson/all/accounting/payments/cancelPayment";

export default function PaymentDetailPage({ params }: { params: { name: string } }) {
    const router = useRouter();
    const [payment, setPayment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cancelLoading, setCancelLoading] = useState(false);

    useEffect(() => {
        loadPayment();
    }, [params.name]);

    const [currency, setCurrency] = useState("USD");

    useEffect(() => {
        loadPayment();
    }, [params.name]);

    async function loadPayment() {
        setLoading(true);

        try {
            const currencyVal = await getSessionCurrency();
            setCurrency(currencyVal);
        } catch (e) {
            console.error("Failed to fetch currency", e);
        }

        const data = await getPayment(params.name);
        if (data) {
            setPayment(data);
        } else {
            toast.error("Payment not found");
            router.push("/handson/all/financials/accounts/payment-entry");
        }
        setLoading(false);
    }

    async function handleCancel() {
        if (!confirm("Are you sure you want to cancel this payment? This will adjust the account balance.")) {
            return;
        }
        setCancelLoading(true);
        const result = await cancelPayment(params.name);
        if (result.success) {
            toast.success("Payment cancelled successfully");
            loadPayment(); // Refresh to show Cancelled status
        } else {
            toast.error(result.error || "Failed to cancel payment");
        }
        setCancelLoading(false);
    }

    function handleAmend() {
        // Redirect to new payment form, passing the current payment details as params (simplified for now)
        // In a real scenario, we might pass an 'amend_from' ID to pre-fill the form cleanly.
        // For now, we'll just go to 'new' and the user can re-enter manually, or we could pass query params.
        // Let's implement a basic 'amend_from' param handling in the 'new' page later if needed,
        // but for now, redirecting to new is the start of the workflow.
        router.push(`/handson/all/financials/accounts/payment-entry/new?amend_from=${payment.name}`);
    }

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading payment details...</div>;
    }

    if (!payment) return null;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{payment.name}</h1>
                        <p className="text-muted-foreground">Payment Entry</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {payment.docstatus === 1 && (
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={cancelLoading}
                        >
                            {cancelLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
                            Cancel
                        </Button>
                    )}
                    {payment.docstatus === 2 && ( // 2 = Cancelled
                        <Button variant="default" onClick={handleAmend}>
                            <Copy className="mr-2 h-4 w-4" />
                            Amend
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant={
                                payment.docstatus === 1 ? "default" :
                                    payment.docstatus === 2 ? "destructive" : "secondary"
                            }>
                                {payment.docstatus === 1 ? "Submitted" :
                                    payment.docstatus === 2 ? "Cancelled" : "Draft"}
                            </Badge>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Payment Type</span>
                            <span>{payment.payment_type}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Party Type</span>
                            <span>{payment.party_type}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Party</span>
                            <span className="font-medium">{payment.party}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Posting Date</span>
                            <span>{payment.posting_date}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Amounts & Accounts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1">
                                <div className="text-sm font-medium text-muted-foreground">Paid Amount</div>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(payment.paid_amount)}
                            </div>
                            {payment.payment_type === "Receive" && (
                                <div className="grid gap-1">
                                    <div className="text-sm font-medium text-muted-foreground">Received Amount</div>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(payment.received_amount)}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Paid From (Account)</span>
                            <span className="text-sm">{payment.paid_from}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Paid To (Account)</span>
                            <span className="text-sm">{payment.paid_to}</span>
                        </div>
                        {payment.remarks && (
                            <div className="pt-2">
                                <span className="text-muted-foreground block text-xs mb-1">Remarks</span>
                                <div className="bg-muted p-2 rounded text-sm text-balance">
                                    {payment.remarks}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {(payment.references && payment.references.length > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle>References</CardTitle>
                        <CardDescription>Invoices linked to this payment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {payment.references.map((ref: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center bg-muted/30 p-3 rounded">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{ref.reference_doctype} - {ref.reference_name}</span>
                                        <span className="text-xs text-muted-foreground">Grand Total: {ref.total_amount}</span>
                                    </div>
                                    <div className="grid gap-1">
                                        <div className="text-sm font-medium text-muted-foreground">Allocated Amount</div>
                                        <div>{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(ref.allocated_amount)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
