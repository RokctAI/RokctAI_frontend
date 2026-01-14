"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyAnnouncements } from "@/app/actions/handson/tenant/announcements/announcements";

export default function TenantAnnouncementsPage() {
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyAnnouncements().then(data => {
            setList(data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Lightbulb className="h-8 w-8 text-yellow-500" /> Announcements
                </h1>
                <p className="text-muted-foreground">Updates and news from the platform team.</p>
            </div>

            <div className="space-y-4">
                {list.length === 0 && !loading && (
                    <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
                        No new announcements.
                    </div>
                )}
                {list.map((ann, i) => (
                    <Card key={i} className="border-l-4 border-l-yellow-400">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{ann.title}</CardTitle>
                                <span className="text-xs text-muted-foreground flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {ann.creation ? new Date(ann.creation).toLocaleDateString() : "Just now"}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm dark:prose-invert">
                                <p>{ann.content}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
