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
import { deleteItem } from "@/app/actions/handson/all/accounting/inventory/item";
import { toast } from "sonner";

interface ItemListProps {
    items: any[];
}

export function ItemList({ items }: ItemListProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    const handleDelete = async (item_code: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        const result = await deleteItem(item_code);
        if (result.success) {
            toast.success("Item deleted");
            router.refresh();
        } else {
            toast.error("Failed to delete: " + result.error);
        }
    };

    const filteredItems = items.filter(i =>
        i.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.item_group && i.item_group.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Stock Items</h1>
                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search Items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Link href="/handson/all/supply_chain/stock/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Item
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item Code</TableHead>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Group</TableHead>
                            <TableHead>UOM</TableHead>
                            <TableHead className="text-right">Rate</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No items found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredItems.map((item) => (
                                <TableRow key={item.item_code}>
                                    <TableCell className="font-medium">{item.item_code}</TableCell>
                                    <TableCell>{item.item_name}</TableCell>
                                    <TableCell>{item.item_group}</TableCell>
                                    <TableCell>{item.stock_uom}</TableCell>
                                    <TableCell className="text-right">
                                        {item.standard_rate?.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 justify-end">
                                            <Link href={`/handson/all/supply_chain/stock/${item.item_code}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(item.item_code)}
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
