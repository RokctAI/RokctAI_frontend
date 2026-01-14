"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function IssueList({ issues }: { issues: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const filtered = issues.filter(i =>
        i.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPriorityColor = (p: string) => {
        switch (p) {
            case "Urgent": return "destructive";
            case "High": return "destructive"; // or separate variant
            case "Medium": return "default"; // or secondary
            default: return "secondary"; // Low
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Support Issues</h1>
                    <p className="text-muted-foreground">Track tickets and helpdesk requests.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search Issues..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Link href="/handson/all/commercial/support/issue/new">
                        <Button><Plus className="mr-2 h-4 w-4" /> New Ticket</Button>
                    </Link>
                </div>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead>Raised By</TableHead><TableHead></TableHead></TableRow></TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No issues found.</TableCell></TableRow> :
                            filtered.map(i => (
                                <TableRow key={i.name}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                        {i.subject}
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{i.status}</Badge></TableCell>
                                    <TableCell><Badge variant={getPriorityColor(i.priority) as any}>{i.priority}</Badge></TableCell>
                                    <TableCell>{i.raised_by || "-"}</TableCell>
                                    <TableCell>
                                        <Link href={`/handson/all/commercial/support/issue/${i.name}`}>
                                            <Button variant="ghost" size="sm">View</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
