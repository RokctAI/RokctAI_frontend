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
import { deleteInvoice } from "@/app/actions/handson/all/accounting/invoices/deleteInvoice";
import { toast } from "sonner";

interface InvoiceListProps {
    invoices: any[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
    const router = useRouter();

    const handleDelete = async (name: string) => {
        if (!confirm("Are you sure you want to delete this invoice?")) return;

        const result = await deleteInvoice(name);
        if (result.success) {
            toast.success("Invoice deleted");
            router.refresh();
        } else {
            toast.error("Failed to delete: " + result.error);
        }
    };

    const [searchTerm, setSearchTerm] = useState("");

    const filteredInvoices = invoices.filter(inv =>
        inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.customer_name && inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Sales Invoices</h1>
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
                    <Link href="/handson/all/financials/accounts/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Customer</TableHead>
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
                                    No invoices found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredInvoices.map((inv) => (
                                <TableRow key={inv.name}>
                                    <TableCell className="font-medium">{inv.name}</TableCell>
                                    <TableCell>{inv.customer_name}</TableCell>
                                    <TableCell>{inv.posting_date}</TableCell>
                                    <TableCell>{inv.due_date}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                            ${inv.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                                inv.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                                                    inv.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                        inv.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                                            {inv.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {inv.grand_total?.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 justify-end">
                                            <Link href={`/handson/all/financials/accounts/${inv.name}`}>
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
