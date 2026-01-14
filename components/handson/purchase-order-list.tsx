"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Plus, Search, CreditCard } from "lucide-react";
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
import { deletePurchaseOrder } from "@/app/actions/handson/all/accounting/buying/order";
import { toast } from "sonner";

interface PurchaseOrderListProps {
    orders: any[];
    canEdit: boolean;
}

export function PurchaseOrderList({ orders, canEdit }: PurchaseOrderListProps) {
    const router = useRouter();

    const handleDelete = async (name: string) => {
        if (!confirm("Are you sure you want to delete this order?")) return;

        const result = await deletePurchaseOrder(name);
        if (result.success) {
            toast.success("Purchase Order deleted");
            router.refresh();
        } else {
            toast.error("Failed to delete: " + result.error);
        }
    };

    const [searchTerm, setSearchTerm] = useState("");

    const filteredOrders = orders.filter(o =>
        o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.supplier_name && o.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Purchase Orders</h1>
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
                    {canEdit && (
                        <Link href="/handson/all/supply_chain/buying/new">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> New Order
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order) => (
                                <TableRow key={order.name}>
                                    <TableCell className="font-medium">{order.name}</TableCell>
                                    <TableCell>{order.supplier_name}</TableCell>
                                    <TableCell>{order.transaction_date}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                            ${order.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                                order.status === 'Submitted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}>
                                            {order.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {order.grand_total?.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 justify-end">
                                            <Link href={`/handson/all/financials/accounts/purchase-invoice/new?from_po=${order.name}`}>
                                                <Button variant="ghost" size="icon" title="Make Bill">
                                                    <CreditCard className="h-4 w-4 text-green-600" />
                                                </Button>
                                            </Link>
                                            <Link href={`/handson/all/supply_chain/buying/${order.name}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            {canEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(order.name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
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
