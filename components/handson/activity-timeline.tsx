"use client";


import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Settings } from "lucide-react";

interface TimelineItem {
    id: string;
    type: "comment" | "system" | "email" | "version";
    content: string;
    owner: string;
    timestamp: string;
    subject?: string;
    link?: string;
}

interface ActivityTimelineProps {
    items: TimelineItem[];
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
    const getInitials = (name: string) => (name || "?").substring(0, 2).toUpperCase();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {items.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            No activity yet.
                        </div>
                    ) : (
                        items.map((item, idx) => (
                            <div key={idx} className="flex gap-4">
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarFallback className={item.type === 'system' ? "bg-muted text-muted-foreground" : ""}>
                                        {item.type === 'system' ? <Settings className="w-4 h-4" /> : getInitials(item.owner)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">
                                            {item.type === 'system' ? "System" : item.owner}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <div
                                        className="text-sm text-foreground bg-muted/30 p-3 rounded-md prose-sm"
                                        dangerouslySetInnerHTML={{ __html: item.content }}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
