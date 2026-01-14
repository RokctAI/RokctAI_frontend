"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Plus, Search, MapPin, Building2 } from "lucide-react";
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
import { deleteProspect } from "@/app/actions/handson/all/crm/prospects";
import { toast } from "sonner";

interface ProspectListProps {
    prospects: any[];
}

export function ProspectList({ prospects }: ProspectListProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    const handleDelete = async (name: string) => {
        if (!confirm("Are you sure you want to delete this prospect?")) return;

        const result = await deleteProspect(name);
        if (result.success) {
            toast.success("Prospect deleted");
            router.refresh();
        } else {
            toast.error("Failed to delete: " + result.error);
        }
    };

    const filtered = prospects.filter(p =>
        (p.company_name && p.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.customer_group && p.customer_group.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Prospects</h1>
                    <p className="text-muted-foreground">Manage potential customer companies.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search Prospects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Link href="/handson/all/commercial/crm/prospects/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Prospect
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Company Name</TableHead>
                            <TableHead>Industry</TableHead>
                            <TableHead>Group</TableHead>
                            <TableHead>Territory</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No prospects found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((prospect) => (
                                <TableRow key={prospect.name}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        {prospect.company_name}
                                    </TableCell>
                                    <TableCell>{prospect.industry || "-"}</TableCell>
                                    <TableCell>{prospect.customer_group || "-"}</TableCell>
                                    <TableCell>
                                        {prospect.territory && (
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <MapPin className="h-3 w-3" /> {prospect.territory}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 justify-end">
                                            <Link href={`/handson/all/commercial/crm/prospects/${prospect.name}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(prospect.name)}
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
