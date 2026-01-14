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
import { deleteAsset } from "@/app/actions/handson/all/accounting/assets";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface AssetListProps {
    assets: any[];
    employees?: any[];
}

export function AssetList({ assets, employees = [] }: AssetListProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    // ... (handleDelete)

    const filteredAssets = assets.filter(a =>
        (a.asset_name && a.asset_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.item_code && a.item_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.location && a.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.custodian && employees.find(e => e.name === a.custodian)?.employee_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            {/* ... header ... */}

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Asset Name</TableHead>
                            <TableHead>Item Code</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Custodian</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Purchase Date</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAssets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    No assets found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAssets.map((asset) => (
                                <TableRow key={asset.name}>
                                    <TableCell className="font-medium">{asset.asset_name || asset.name}</TableCell>
                                    <TableCell>{asset.item_code}</TableCell>
                                    <TableCell>{asset.location || "-"}</TableCell>
                                    <TableCell>
                                        {asset.custodian ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{employees.find(e => e.name === asset.custodian)?.employee_name || asset.custodian}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground italic">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={asset.status === "Submitted" ? "default" : "secondary"}>
                                            {asset.status || "Draft"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{asset.purchase_date}</TableCell>
                                    <TableCell className="text-right">
                                        {asset.gross_purchase_amount?.toLocaleString() || "0"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 justify-end">
                                            <Link href={`/handson/all/financials/assets/${asset.name}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(asset.name)}
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
