"use client";


import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface KanbanItem {
    id: string;
    title: string;
    status: string;
    subtitle?: string;
    owner?: string;
    value?: number;
}

interface KanbanBoardProps {
    items: KanbanItem[];
    columns: string[];
    onStatusChange?: (id: string, newStatus: string) => void;
    basePath: string; // e.g. /handson/crm/leads
}

export function KanbanBoard({ items, columns, basePath }: KanbanBoardProps) {

    // Group items by status
    const groupedItems = columns.reduce((acc, col) => {
        acc[col] = items.filter(item => item.status === col);
        return acc;
    }, {} as Record<string, KanbanItem[]>);

    const getInitials = (name: string) => (name || "?").substring(0, 2).toUpperCase();

    return (
        <div className="flex h-[calc(100vh-220px)] gap-4 overflow-x-auto pb-4">
            {columns.map(col => (
                <div key={col} className="w-80 flex-shrink-0 flex flex-col bg-muted/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="font-semibold text-sm">{col}</h3>
                        <Badge variant="secondary" className="text-xs">
                            {groupedItems[col]?.length || 0}
                        </Badge>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col gap-3">
                            {groupedItems[col]?.map(item => (
                                <Link key={item.id} href={`${basePath}/${item.id}`}>
                                    <Card className="hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                                        <CardHeader className="p-3 pb-0">
                                            <CardTitle className="text-sm font-medium leading-tight">
                                                {item.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-3">
                                            {item.subtitle && (
                                                <p className="text-xs text-muted-foreground mb-2 truncate">
                                                    {item.subtitle}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-1.5">
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarFallback className="text-[9px]">
                                                            {getInitials(item.owner || "?")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                {item.value !== undefined && (
                                                    <span className="text-xs font-semibold">
                                                        ${item.value.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            ))}
        </div>
    );
}
