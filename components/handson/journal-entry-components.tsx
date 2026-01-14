"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { createJournalEntry } from "@/app/actions/handson/all/accounting/journals/createJournalEntry";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function JournalEntryList({ items }: { items: any[] }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-2xl font-bold">Journal Entries</h1><p className="text-muted-foreground">General Ledger Adjustments.</p></div>
                <Link href="/handson/all/financials/accounts/journal-entry/new"><Button><Plus className="mr-2 h-4 w-4" /> New Entry</Button></Link>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader><TableRow><TableHead>Voucher No</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead>Total Debit</TableHead></TableRow></TableHeader>
                    <TableBody>{items.map(t => <TableRow key={t.name}><TableCell>{t.name}</TableCell><TableCell>{t.voucher_type}</TableCell><TableCell>{t.posting_date}</TableCell><TableCell>{t.total_debit}</TableCell></TableRow>)}</TableBody>
                </Table>
            </div>
        </div>
    );
}

export function JournalEntryForm() {
    const router = useRouter();
    const [account1, setAccount1] = useState("");
    const [debit, setDebit] = useState(0);
    const [account2, setAccount2] = useState("");
    const [credit, setCredit] = useState(0);

    const handleSubmit = async () => {
        if (debit !== credit) { toast.error("Debit and Credit must match!"); return; }

        const res = await createJournalEntry({
            company: "Juvo",
            voucher_type: "Journal Entry",
            posting_date: new Date().toISOString().split('T')[0],
            accounts: [
                { account: account1, debit_in_account_currency: debit, credit_in_account_currency: 0 },
                { account: account2, debit_in_account_currency: 0, credit_in_account_currency: credit }
            ]
        });
        if (res.success) { toast.success("Entry Posted"); router.push("/handson/all/financials/accounts/journal-entry"); }
        else toast.error(res.error);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">New Journal Entry</h1>
            <Card>
                <CardContent className="space-y-4 pt-4">
                    <div className="p-4 border rounded bg-muted/20">
                        <Label className="font-bold mb-2 block">Debit Entry</Label>
                        <div className="flex gap-4">
                            <div className="flex-1"><Label>Account</Label><Input value={account1} onChange={e => setAccount1(e.target.value)} placeholder="e.g. Bank" /></div>
                            <div className="w-32"><Label>Debit Amount</Label><Input type="number" value={debit} onChange={e => setDebit(Number(e.target.value))} /></div>
                        </div>
                    </div>

                    <div className="p-4 border rounded bg-muted/20">
                        <Label className="font-bold mb-2 block">Credit Entry</Label>
                        <div className="flex gap-4">
                            <div className="flex-1"><Label>Account</Label><Input value={account2} onChange={e => setAccount2(e.target.value)} placeholder="e.g. Cash" /></div>
                            <div className="w-32"><Label>Credit Amount</Label><Input type="number" value={credit} onChange={e => setCredit(Number(e.target.value))} /></div>
                        </div>
                    </div>

                    <Button onClick={handleSubmit} className="w-full">Post Entry</Button>
                </CardContent>
            </Card>
        </div>
    );
}
