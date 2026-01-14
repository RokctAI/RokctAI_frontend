"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ViewToggle } from "@/components/handson/view-toggle";
import { KanbanBoard } from "@/components/handson/kanban-board";

const LEAD_STATUSES = ["Lead", "Open", "Replied", "Opportunity", "Quotation", "Lost Lead", "Interest", "Converted", "Do Not Contact"];

export function LeadsClientView({ leads }: { leads: any[] }) {
    const [view, setView] = useState<"list" | "kanban">("list");

    const getInitials = (name: string) => (name || "?").substring(0, 2).toUpperCase();

    // Map leads to kanban format
    const kanbanItems = leads.map(l => ({
        id: l.name,
        title: l.first_name || l.lead_name,
        subtitle: l.organization,
        status: l.status,
        owner: l.lead_owner
    }));

    // Filter statuses that have items or are common default statuses
    const activeColumns = LEAD_STATUSES.filter(s =>
        kanbanItems.some((i: any) => i.status === s) || ["Lead", "Open", "Converted"].includes(s)
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <ViewToggle view={view} onViewChange={setView} />
            </div>

            {view === "kanban" ? (
                <KanbanBoard
                    items={kanbanItems}
                    columns={activeColumns}
                    basePath="/handson/all/crm/leads"
                />
            ) : (
                <Card className="glass-card shadow-xl border-none">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold tracking-tight">Lead Directory</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {leads.length === 0 ? (
                            <div className="flex h-40 items-center justify-center text-muted-foreground">
                                No leads found.
                            </div>
                        ) : (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm text-left">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Lead</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Entity</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Contact</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Verification</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {leads.map((lead: any) => (
                                            <tr
                                                key={lead.name}
                                                className="border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-muted group"
                                            >
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                                                                {getInitials(lead.first_name || lead.lead_name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                                {lead.first_name || lead.lead_name} {lead.last_name || ""}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">{lead.lead_owner || "Unassigned"}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{lead.organization || "Private Individual"}</span>
                                                        {lead.industry && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{lead.industry}</span>}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex flex-col text-xs space-y-1">
                                                        <span className="text-muted-foreground">{lead.email_id || "-"}</span>
                                                        <span className="text-muted-foreground">{lead.mobile_no || "-"}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        {lead.kyc_status === "Verified" ? (
                                                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-2 py-0">
                                                                <span className="h-1 w-1 rounded-full bg-emerald-500 mr-2" />
                                                                KYC Verified
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-amber-600 border-amber-200 px-2 py-0 bg-amber-50/50">
                                                                Pending
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <Badge
                                                        variant="secondary"
                                                        className={`font-medium ${lead.status === "Converted" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                                                                lead.status === "Lost Lead" ? "bg-rose-50 text-rose-700 border-rose-100" : ""
                                                            }`}
                                                    >
                                                        {lead.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
