"use client";

import { useEffect, useState } from "react";
import { fetchMyBatches } from "@/app/actions/handson/all/lms/batches/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/app/lib/format";

export default function BatchesPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBatches();
    }, []);

    async function loadBatches() {
        setLoading(true);
        try {
            const data = await fetchMyBatches();
            if (data) setBatches(data);
        } catch (err) {
            toast.error("Failed to load batches");
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div className="container max-w-5xl py-10 grid gap-4 grid-cols-1 md:grid-cols-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
    );

    return (
        <div className="container max-w-5xl py-10 space-y-8">
            <h1 className="text-3xl font-bold">My Batches</h1>

            {batches.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-lg">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium">No Batches Found</h3>
                    <p className="text-muted-foreground">You are not enrolled in any batches yet.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {batches.map((batch) => (
                        <Card key={batch.name}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle>{batch.title || batch.name}</CardTitle>
                                        <CardDescription>{batch.course_title || batch.course}</CardDescription>
                                    </div>
                                    <Badge>{batch.status || "Active"}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>Start: {formatDate(batch.start_date)}</span>
                                        {batch.end_date && <span> - End: {formatDate(batch.end_date)}</span>}
                                    </div>
                                    {/* Additional metadata like time or instructor could go here if available */}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
