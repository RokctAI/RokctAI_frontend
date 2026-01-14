"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function StockEntryList({ entries }: { entries: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const filtered = entries.filter(e => e.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-2xl font-bold">Stock Entries</h1><p className="text-muted-foreground">Transfers, Issues, Receipts.</p></div>
                <div className="flex gap-4">
                    <Link href="/handson/all/supply_chain/stock/entry/new"><Button><Plus className="mr-2 h-4 w-4" /> New Entry</Button></Link>
                </div>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead></TableHead></TableRow></TableHeader>
                    <TableBody>
                        {filtered.map(e => (
                            <TableRow key={e.name}>
                                <TableCell>{e.name}</TableCell>
                                <TableCell>{e.stock_entry_type}</TableCell>
                                <TableCell>{e.posting_date}</TableCell>
                                <TableCell>
                                    <Link href={`/handson/all/supply_chain/stock/entry/${e.name}`}>
                                        <Button variant="ghost" size="sm">View</Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
