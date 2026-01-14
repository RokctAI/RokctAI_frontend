"use client";

import { Loader2, Plus, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getShops, deleteShop } from "@/app/actions/paas/admin/shops";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminShopsPage() {
    const [shops, setShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShops();
    }, []);

    async function fetchShops() {
        try {
            const data = await getShops();
            setShops(data);
        } catch (error) {
            console.error("Error fetching shops:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (name: string) => {
        if (!confirm("Are you sure you want to delete this shop?")) return;
        try {
            await deleteShop(name);
            toast.success("Shop deleted successfully");
            fetchShops();
        } catch (error) {
            toast.error("Failed to delete shop");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Shop Management</h1>
                <Button asChild>
                    <Link href="/paas/admin/shops/new">
                        <Plus className="mr-2 size-4" />
                        Add Shop
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Shop Name</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Ecommerce</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shops.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">
                                    No shops found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            shops.map((shop) => (
                                <TableRow key={shop.name}>
                                    <TableCell className="font-medium">
                                        {shop.name}
                                    </TableCell>
                                    <TableCell>
                                        {shop.user}
                                    </TableCell>
                                    <TableCell>
                                        {shop.shop_type}
                                    </TableCell>
                                    <TableCell>
                                        {shop.is_ecommerce ? "Yes" : "No"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/admin/shops/${shop.name}`}>
                                                    <Edit className="size-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600"
                                                onClick={() => handleDelete(shop.name)}
                                            >
                                                <Trash2 className="size-4" />
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
