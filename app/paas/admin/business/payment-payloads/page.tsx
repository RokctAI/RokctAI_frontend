"use client";

import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { getPaymentPayloads } from "@/app/actions/paas/admin/finance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function PaymentPayloadsPage() {
    const [loading, setLoading] = useState(true);
    const [payloads, setPayloads] = useState<any[]>([]);
    const [selectedPayload, setSelectedPayload] = useState<any>(null);

    useEffect(() => {
        loadPayloads();
    }, []);

    async function loadPayloads() {
        try {
            const data = await getPaymentPayloads();
            setPayloads(data);
        } catch (error) {
            toast.error("Failed to load payment payloads");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="size-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Payment Payloads</h2>
                <p className="text-muted-foreground">
                    View raw payment webhook payloads for debugging.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Payloads</CardTitle>
                    <CardDescription>
                        A list of the most recent payment payloads received by the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Preview</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payloads.map((payload) => (
                                <TableRow
                                    key={payload.name}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => setSelectedPayload(payload)}
                                >
                                    <TableCell className="font-medium">{payload.name}</TableCell>
                                    <TableCell>{new Date(payload.creation).toLocaleString()}</TableCell>
                                    <TableCell className="max-w-[300px] truncate">
                                        {typeof payload.payload === 'string' ? payload.payload : JSON.stringify(payload.payload)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {payloads.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        No payment payloads found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedPayload} onOpenChange={(open) => !open && setSelectedPayload(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Payload Details</DialogTitle>
                        <DialogDescription>
                            {selectedPayload?.name} - {new Date(selectedPayload?.creation).toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 bg-muted p-4 rounded-md overflow-x-auto">
                        <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                            {selectedPayload && JSON.stringify(
                                typeof selectedPayload.payload === 'string'
                                    ? JSON.parse(selectedPayload.payload)
                                    : selectedPayload.payload,
                                null,
                                2
                            )}
                        </pre>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
