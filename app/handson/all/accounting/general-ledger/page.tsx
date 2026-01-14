"use client";

import { useEffect, useState } from "react";
import { Search, Filter, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getJournalEntries as getGLEntries } from "@/app/actions/handson/all/accounting/journals/getJournalEntries";
import { getSessionCurrency } from "@/app/actions/currency";


export default function GeneralLedgerPage() {
    const router = useRouter();
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadEntries();
    }, []);

    async function loadEntries() {
        setLoading(true);
        const data = await getGLEntries();
        setEntries(data);
        setLoading(false);
    }

    const filteredEntries = entries.filter(entry =>
        entry.account.toLowerCase().includes(search.toLowerCase()) ||
        entry.party?.toLowerCase().includes(search.toLowerCase()) ||
        entry.voucher_no?.toLowerCase().includes(search.toLowerCase())
    );

    const [currency, setCurrency] = useState("USD");

    useEffect(() => {
        getSessionCurrency().then(c => setCurrency(c));
    }, []);

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">General Ledger</h1>
                    <p className="text-muted-foreground">Detailed transaction logs (GL Entries) for all accounts.</p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="relative w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search Account, Party, or Voucher No..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {/* Future: Add Date Range Filter here */}
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Posting Date</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead>Party</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                            <TableHead>Voucher</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Loading transactions...</TableCell>
                            </TableRow>
                        ) : filteredEntries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEntries.map((entry) => (
                                <TableRow key={entry.name} className="hover:bg-muted/50">
                                    <TableCell>{entry.posting_date}</TableCell>
                                    <TableCell className="font-medium">{entry.account}</TableCell>
                                    <TableCell>
                                        {entry.party ? (
                                            <div className="flex flex-col">
                                                <span>{entry.party}</span>
                                                <span className="text-xs text-muted-foreground">{entry.party_type}</span>
                                            </div>
                                        ) : "-"}
                                    </TableCell>
                                    <TableCell className="text-right text-red-600">
                                        {entry.debit > 0 ? formatCurrency(entry.debit) : ""}
                                    </TableCell>
                                    <TableCell className="text-right text-green-600">
                                        {entry.credit > 0 ? formatCurrency(entry.credit) : ""}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{entry.voucher_no}</span>
                                            <span className="text-xs text-muted-foreground">{entry.voucher_type}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
