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
import { deleteOpportunity } from "@/app/actions/handson/all/crm/deals";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface OpportunityListProps {
    opportunities: any[];
}

export function OpportunityList({ opportunities }: OpportunityListProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    const handleDelete = async (name: string) => {
        if (!confirm("Are you sure you want to delete this opportunity?")) return;

        const result = await deleteOpportunity(name);
        if (result.success) {
            toast.success("Opportunity deleted");
            router.refresh();
        } else {
            toast.error("Failed to delete: " + result.error);
        }
    };

    const filtered = opportunities.filter(o =>
        (o.party_name && o.party_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Opportunities</h1>
                    <p className="text-muted-foreground">Manage sales opportunities and deals.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search Opportunities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Link href="/handson/all/commercial/crm/opportunities/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Opportunity
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Party</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No opportunities found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((opp) => (
                                <TableRow key={opp.name}>
                                    <TableCell className="font-medium">{opp.party_name}</TableCell>
                                    <TableCell>{opp.opportunity_from}</TableCell>
                                    <TableCell>
                                        <Badge variant={opp.status === "Converted" ? "default" : "secondary"}>
                                            {opp.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{opp.transaction_date}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 justify-end">
                                            <Link href={`/handson/all/commercial/crm/opportunities/${opp.name}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(opp.name)}
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
