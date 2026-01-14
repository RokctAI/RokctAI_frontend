"use client";

import { Loader2, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getRefunds, updateRefund } from "@/app/actions/paas/refunds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export default function RefundsPage() {
    const [refunds, setRefunds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRefund, setSelectedRefund] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [answer, setAnswer] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchRefunds();
    }, []);

    async function fetchRefunds() {
        try {
            const data = await getRefunds();
            setRefunds(data);
        } catch (error) {
            console.error("Error fetching refunds:", error);
            toast.error("Failed to load refunds");
        } finally {
            setLoading(false);
        }
    }

    const handleOpenDialog = (refund: any) => {
        setSelectedRefund(refund);
        setAnswer(refund.answer || "");
        setIsDialogOpen(true);
    };

    const handleUpdateStatus = async (status: string) => {
        if (!selectedRefund) return;

        setProcessing(true);
        try {
            await updateRefund(selectedRefund.name, status, answer);
            toast.success(`Refund ${status.toLowerCase()} successfully`);
            setIsDialogOpen(false);
            fetchRefunds();
        } catch (error) {
            console.error("Error updating refund:", error);
            toast.error("Failed to update refund");
        } finally {
            setProcessing(false);
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
            <div>
                <h1 className="text-3xl font-bold">Refund Requests</h1>
                <p className="text-muted-foreground">Manage customer refund requests.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Refund Requests</CardTitle>
                    <CardDescription>Review and process refund requests from customers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Answer</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {refunds.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No refund requests found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                refunds.map((refund) => (
                                    <TableRow key={refund.name}>
                                        <TableCell className="font-medium">{refund.order}</TableCell>
                                        <TableCell className="max-w-xs truncate">{refund.cause}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                refund.status === 'Accepted' ? 'default' :
                                                    refund.status === 'Canceled' ? 'destructive' :
                                                        'secondary'
                                            }>
                                                {refund.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{refund.answer || "-"}</TableCell>
                                        <TableCell className="text-right">
                                            {refund.status === 'New' && (
                                                <Button size="sm" variant="outline" onClick={() => handleOpenDialog(refund)}>
                                                    Review
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review Refund Request</DialogTitle>
                        <DialogDescription>
                            Order: {selectedRefund?.order}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label className="font-semibold">Customer Reason:</Label>
                            <p className="text-sm text-muted-foreground mt-1">{selectedRefund?.cause}</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="answer">Your Response (Optional)</Label>
                            <Textarea
                                id="answer"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Provide a response to the customer..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleUpdateStatus('Accepted')}
                            disabled={processing}
                        >
                            <Check className="size-4 mr-2" />
                            Accept Refund
                        </Button>
                        <Button
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleUpdateStatus('Canceled')}
                            disabled={processing}
                        >
                            <X className="size-4 mr-2" />
                            Reject Refund
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
