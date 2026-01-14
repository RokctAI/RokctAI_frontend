"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { createPayment } from "@/app/actions/handson/all/accounting/payments/createPayment";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function PaymentEntryList({ items }: { items: any[] }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-2xl font-bold">Payment Entries</h1><p className="text-muted-foreground">Incoming and Outgoing Payments.</p></div>
                <Link href="/handson/all/financials/accounts/payment-entry/new"><Button><Plus className="mr-2 h-4 w-4" /> Record Payment</Button></Link>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Party</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                    <TableBody>{items.map(t => <TableRow key={t.name}><TableCell><Badge variant={t.payment_type === "Receive" ? "default" : "secondary"}>{t.payment_type}</Badge></TableCell><TableCell>{t.party_name}</TableCell><TableCell>{t.paid_amount}</TableCell><TableCell>{t.posting_date}</TableCell></TableRow>)}</TableBody>
                </Table>
            </div>
        </div>
    );
}

export function PaymentEntryForm() {
    const router = useRouter();
    const [type, setType] = useState<"Pay" | "Receive">("Pay");
    const [partyType, setPartyType] = useState<"Supplier" | "Customer">("Supplier");
    const [party, setParty] = useState("");
    const [amount, setAmount] = useState(0);

    const handleSubmit = async () => {
        const res = await createPayment({ payment_type: type, party_type: partyType, party, paid_amount: amount });
        if (res.success) { toast.success("Payment Recorded"); router.push("/handson/all/financials/accounts/payment-entry"); }
        else toast.error(res.error);
    };

    return (
        <div className="max-w-md mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Record Payment</h1>
            <Card>
                <CardContent className="space-y-4 pt-4">
                    <div>
                        <Label>Payment Type</Label>
                        <RadioGroup value={type} onValueChange={(v: any) => setType(v)} className="flex gap-4 mt-2">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Pay" id="r1" /><Label htmlFor="r1">Pay (Out)</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Receive" id="r2" /><Label htmlFor="r2">Receive (In)</Label></div>
                        </RadioGroup>
                    </div>

                    <div className="flex gap-2">
                        <div className="w-1/3">
                            <Label>Party Type</Label>
                            <Select value={partyType} onValueChange={(v: any) => setPartyType(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="Supplier">Supplier</SelectItem><SelectItem value="Customer">Customer</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <Label>Party Name</Label>
                            <Input value={party} onChange={e => setParty(e.target.value)} />
                        </div>
                    </div>

                    <div><Label>Amount</Label><Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} /></div>
                    <Button onClick={handleSubmit} className="w-full">Record {type}</Button>
                </CardContent>
            </Card>
        </div>
    );
}
