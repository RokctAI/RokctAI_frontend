"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getShopTags } from "@/app/actions/paas/admin/shops";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ShopTagsPage() {
    const [tags, setTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTags() {
            try {
                const data = await getShopTags();
                setTags(data);
            } catch (error) {
                console.error("Error fetching shop tags:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTags();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Shop Tags</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Active</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center">
                                    <Loader2 className="size-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : tags.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                    No tags found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tags.map((tag) => (
                                <TableRow key={tag.name}>
                                    <TableCell className="font-medium">{tag.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={tag.active ? "default" : "secondary"}>
                                            {tag.active ? "Active" : "Inactive"}
                                        </Badge>
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
