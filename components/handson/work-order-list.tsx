"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Plus, Search } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface WorkOrderListProps {
    orders: any[];
}

export function WorkOrderList({ orders }: WorkOrderListProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = orders.filter(o =>
        (o.production_item && o.production_item.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.name && o.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Work Orders</h1>
                    <p className="text-muted-foreground">Manage production orders.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search Work Orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Link href="/handson/all/supply_chain/manufacturing/work-order/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Work Order
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>W.O.</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No work orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((wo) => (
                                <TableRow key={wo.name}>
                                    <TableCell className="font-medium">{wo.name}</TableCell>
                                    <TableCell>{wo.production_item}</TableCell>
                                    <TableCell>{wo.qty}</TableCell>
                                    <TableCell>{wo.planned_start_date}</TableCell>
                                    <TableCell>
                                        <Badge variant={wo.status === "Completed" ? "default" : "secondary"}>
                                            {wo.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 justify-end">
                                            <Link href={`/handson/all/supply_chain/manufacturing/work-order/${wo.name}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
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
