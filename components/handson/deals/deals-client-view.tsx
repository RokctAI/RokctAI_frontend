'use client'

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ViewToggle } from "@/components/handson/view-toggle";
import { KanbanBoard } from "@/components/handson/kanban-board";

const DEAL_STATUSES = ["Open", "Won", "Lost", "Replied", "Opportunity", "Quotation"];

export function DealsClientView({ deals }: { deals: any[] }) {
    const [view, setView] = useState<"list" | "kanban">("list");

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD",
        }).format(amount);
    };

    const getInitials = (name: string) => (name || "?").substring(0, 2).toUpperCase();

    // Map deals to kanban format
    const kanbanItems = deals.map(d => ({
        id: d.name,
        title: d.deal_name || d.title,
        subtitle: d.organization,
        status: d.status,
        owner: d.owner,
        value: d.currency ? formatCurrency(d.value, d.currency) : d.value
    }));

    // Filter statuses that have items or are common default statuses
    const activeColumns = DEAL_STATUSES.filter(s =>
        kanbanItems.some((i: any) => i.status === s) || ["Open", "Won", "Lost"].includes(s)
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
                    basePath="/handson/all/crm/deals"
                />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>All Deals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {deals.length === 0 ? (
                            <div className="flex h-40 items-center justify-center text-muted-foreground">
                                No deals found.
                            </div>
                        ) : (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm text-left">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Deal Name</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Organization</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Value</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Probability</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {deals.map((deal: any) => (
                                            <tr
                                                key={deal.name}
                                                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                            >
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarFallback>{getInitials(deal.owner)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-foreground">{deal.deal_name || deal.title}</span>
                                                            <span className="text-xs text-muted-foreground">Owner: {deal.owner}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground">
                                                    {deal.organization || "-"}
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground">
                                                    {formatCurrency(deal.value, deal.currency)}
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground">
                                                    {deal.probability}%
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <Badge variant={deal.status === "Won" ? "default" : (deal.status === "Lost" ? "destructive" : "secondary")}>
                                                        {deal.status}
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
