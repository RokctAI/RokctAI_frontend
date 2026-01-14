"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function SubcontractingOrderList({ orders }: { orders: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const filtered = orders.filter(o => o.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Subcontracting Orders</h1>
                    <p className="text-muted-foreground">Manage outsourcing jobs.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Link href="/handson/all/supply_chain/subcontracting/order/new">
                        <Button><Plus className="mr-2 h-4 w-4" /> New Order</Button>
                    </Link>
                </div>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Supplier</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                    <TableBody>
                        {filtered.map(o => (
                            <TableRow key={o.name}>
                                <TableCell className="font-medium">{o.name}</TableCell>
                                <TableCell>{o.supplier}</TableCell>
                                <TableCell>{o.transaction_date}</TableCell>
                                <TableCell><Badge variant="outline">{o.status}</Badge></TableCell>
                                <TableCell>
                                    <Link href={`/handson/all/supply_chain/subcontracting/order/${o.name}`}>
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
