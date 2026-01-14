"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Plus, Search, Phone, Mail } from "lucide-react";
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
import { deleteLead } from "@/app/actions/handson/all/crm/leads";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface LeadListProps {
    leads: any[];
}

export function LeadList({ leads }: LeadListProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    const handleDelete = async (name: string) => {
        if (!confirm("Are you sure you want to delete this lead?")) return;

        const result = await deleteLead(name);
        if (result.success) {
            toast.success("Lead deleted");
            router.refresh();
        } else {
            toast.error("Failed to delete: " + result.error);
        }
    };

    const filteredLeads = leads.filter(l =>
        (l.lead_name && l.lead_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.company_name && l.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Leads</h1>
                    <p className="text-muted-foreground">Manage potential customers and inquiries.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search Leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Link href="/handson/all/commercial/crm/leads/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Lead
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Lead Name</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLeads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No leads found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLeads.map((lead) => (
                                <TableRow key={lead.name}>
                                    <TableCell className="font-medium">{lead.lead_name}</TableCell>
                                    <TableCell>{lead.company_name || "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs text-muted-foreground">
                                            {lead.email_id && (
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" /> {lead.email_id}
                                                </span>
                                            )}
                                            {lead.mobile_no && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" /> {lead.mobile_no}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={lead.status === "Converted" ? "default" : "secondary"}>
                                            {lead.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 justify-end">
                                            <Link href={`/handson/all/commercial/crm/leads/${lead.name}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(lead.name)}
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
