
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Plus, Search } from "lucide-react";
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
import { deletePurchaseInvoice } from "@/app/actions/handson/all/accounting/purchases/deletePurchaseInvoice";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface PurchaseInvoiceListProps {
    invoices: any[];
}

export function PurchaseInvoiceList({ invoices }: PurchaseInvoiceListProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    const handleDelete = async (name: string) => {
        if (!confirm("Are you sure you want to delete this invoice?")) return;

        const result = await deletePurchaseInvoice(name);
        if (result.success) {
            toast.success("Invoice deleted");
            router.refresh();
        } else {
            toast.error("Failed to delete: " + result.error);
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.supplier_name && inv.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Purchase Invoices</h1>
                    <p className="text-sm text-muted-foreground">Manage your bills and payments to suppliers</p>
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
                    <Link href="/handson/all/financials/accounts/purchase-invoice/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Bill
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Posting Date</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInvoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No purchase invoices found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredInvoices.map((inv) => (
                                <TableRow key={inv.name}>
                                    <TableCell className="font-medium">{inv.name}</TableCell>
                                    <TableCell>{inv.supplier_name || inv.supplier}</TableCell>
                                    <TableCell>{inv.posting_date}</TableCell>
                                    <TableCell>{inv.due_date}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            inv.status === 'Draft' ? 'secondary' :
                                                inv.status === 'Submitted' ? 'default' :
                                                    inv.status === 'Paid' ? 'outline' :  // Greenish? Outline is fine for now
                                                        inv.status === 'Overdue' ? 'destructive' : 'secondary'
                                        }>
                                            {inv.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {inv.grand_total?.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 justify-end">
                                            <Link href={`/handson/all/financials/accounts/purchase-invoice/${inv.name}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(inv.name)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
