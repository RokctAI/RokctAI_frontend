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
import { deleteQuotation } from "@/app/actions/handson/all/accounting/selling/quotation";
import { toast } from "sonner";

interface QuotationListProps {
    quotations: any[]; // Using any for flex from API response
}

export function QuotationList({ quotations }: QuotationListProps) {
    const router = useRouter();

    const handleDelete = async (name: string) => {
        if (!confirm("Are you sure you want to delete this quotation?")) return;

        const result = await deleteQuotation(name);
        if (result.success) {
            toast.success("Quotation deleted");
            router.refresh();
        } else {
            toast.error("Failed to delete: " + result.error);
        }
    };

    const [searchTerm, setSearchTerm] = useState("");

    const filteredQuotations = quotations.filter(q =>
        q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.customer_name && q.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quotations</h1>
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
                    <Link href="/handson/all/commercial/selling/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Quotation
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
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredQuotations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No quotations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredQuotations.map((q) => (
                                <TableRow key={q.name}>
                                    <TableCell className="font-medium">{q.name}</TableCell>
                                    <TableCell>{q.customer_name}</TableCell>
                                    <TableCell>{q.transaction_date}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                            ${q.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                                q.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                                                    q.status === 'Ordered' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                                            {q.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {q.grand_total?.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 justify-end">
                                            <Link href={`/handson/all/commercial/selling/${q.name}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(q.name)}
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
