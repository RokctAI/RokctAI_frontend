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
import { deleteBOM } from "@/app/actions/handson/all/accounting/manufacturing/bom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface BOMListProps {
    boms: any[];
}

export function BOMList({ boms }: BOMListProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    const handleDelete = async (name: string) => {
        if (!confirm("Are you sure you want to delete this BOM?")) return;

        const result = await deleteBOM(name);
        if (result.success) {
            toast.success("BOM deleted");
            router.refresh();
        } else {
            toast.error("Failed to delete: " + result.error);
        }
    };

    const filtered = boms.filter(b =>
        (b.item && b.item.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.name && b.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Bill of Materials</h1>
                    <p className="text-muted-foreground">Manage production recipes.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search BOMs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Link href="/handson/all/supply_chain/manufacturing/bom/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New BOM
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>BOM Name</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No BOMs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((bom) => (
                                <TableRow key={bom.name}>
                                    <TableCell className="font-medium">{bom.name}</TableCell>
                                    <TableCell>{bom.item}</TableCell>
                                    <TableCell>{bom.quantity}</TableCell>
                                    <TableCell>
                                        <Badge variant={bom.is_active ? "default" : "secondary"}>
                                            {bom.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 justify-end">
                                            {/* Editing BOMs is complex if submitted, usually versioned. Allowing simplistic view/edit here. */}
                                            <Link href={`/handson/all/supply_chain/manufacturing/bom/${bom.name}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(bom.name)}
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
