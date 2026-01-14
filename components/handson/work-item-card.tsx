"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckSquare, ClipboardList, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkItemProps {
    item: any;
}

export function WorkItemCard({ item }: WorkItemProps) {
    const isOverdue = item.due_date && new Date(item.due_date) < new Date();

    const getIcon = () => {
        switch (item.type) {
            case 'todo': return <CheckSquare className="h-5 w-5 text-blue-500" />;
            case 'task': return <ClipboardList className="h-5 w-5 text-orange-500" />;
            case 'note': return <StickyNote className="h-5 w-5 text-yellow-500" />;
            default: return <CheckSquare className="h-5 w-5" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'closed':
            case 'completed': return 'bg-green-100 text-green-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    {getIcon()}
                    <CardTitle className="text-sm font-medium leading-none">
                        {item.name}
                    </CardTitle>
                </div>
                {item.status && (
                    <Badge variant="outline" className={cn(getStatusColor(item.status))}>
                        {item.status}
                    </Badge>
                )}
            </CardHeader>
            <CardContent>
                <div className="text-sm font-bold mb-1">
                    {item.description || item.name}
                </div>

                {item.reference_name && (
                    <div className="text-xs text-muted-foreground mb-2">
                        For: {item.reference_type ? `${item.reference_type} - ` : ''}{item.reference_name}
                    </div>
                )}

                <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                        {item.priority && (
                            <span className={cn(
                                "font-medium",
                                item.priority === 'High' ? "text-red-500" : "text-gray-500"
                            )}>
                                {item.priority} Priority
                            </span>
                        )}
                    </div>
                    {item.due_date && (
                        <div className={cn("flex items-center gap-1", isOverdue && "text-red-500 font-bold")}>
                            <Calendar className="h-3 w-3" />
                            {item.due_date}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
