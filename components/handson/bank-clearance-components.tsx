"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateClearanceDate } from "@/app/actions/handson/all/accounting/payments/updateClearanceDate";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function BankClearanceTool({ payments }: { payments: any[] }) {
    // We reuse the payments list but add a date picker action
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [date, setDate] = useState("");

    const handleUpdate = async () => {
        if (!selectedId || !date) return;
        const res = await updateClearanceDate("Payment Entry", selectedId, date);
        if (res.success) {
            toast.success("Clearance Date Updated");
            setSelectedId(null);
            setDate("");
            // In a real app we'd revalidate/refresh here
            window.location.reload();
        } else {
            toast.error(res.error);
        }
    };

    return (
        <div>
            <div className="mb-6"><h1 className="text-2xl font-bold">Bank Clearance</h1><p className="text-muted-foreground">Match system payments with bank statement dates.</p></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 border rounded-lg">
                    <Table>
                        <TableHeader><TableRow><TableHead>Payment</TableHead><TableHead>Party</TableHead><TableHead>Amount</TableHead><TableHead>Clearance Date</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {payments.map(p => (
                                <TableRow key={p.name}>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>{p.party_name}</TableCell>
                                    <TableCell>{p.paid_amount}</TableCell>
                                    <TableCell>{p.clearance_date || <span className="text-muted-foreground italic">Pending</span>}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" onClick={() => setSelectedId(p.name)}>Update</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div>
                    <Card>
                        <CardHeader><CardTitle>Update Clearance</CardTitle></CardHeader>
                        <CardContent>
                            {selectedId ? (
                                <div className="space-y-4">
                                    <div className="text-sm font-medium">Selected: {selectedId}</div>
                                    <div>
                                        <Label>Bank Date</Label>
                                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={handleUpdate} className="flex-1">Save</Button>
                                        <Button variant="ghost" onClick={() => setSelectedId(null)}>Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground py-8 text-center">Select a payment to update.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
