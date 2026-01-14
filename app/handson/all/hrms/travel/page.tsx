"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Plus, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { getTravelRequests } from "@/app/actions/handson/all/hrms/travel";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function TravelPage() {
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const data = await getTravelRequests();
        setRequests(data);
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Travel & Trips</h1>
                    <p className="text-muted-foreground">Manage business travel requests and itineraries.</p>
                </div>
                <Link href="/handson/all/hr/travel/new">
                    <Button><Plus className="mr-2 h-4 w-4" /> New Travel Request</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg bg-slate-50 flex flex-col items-center gap-2">
                        <Plane className="h-10 w-10 opacity-20" />
                        No travel requests found.
                    </div>
                ) : (
                    requests.map((req) => (
                        <Card key={req.name} className="overflow-hidden">
                            <CardHeader className="pb-2 bg-slate-50 border-b">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base font-semibold">{req.purpose}</CardTitle>
                                        <CardDescription className="text-xs">{req.employee}</CardDescription>
                                    </div>
                                    <Badge variant={req.status === "Approved" ? "default" : "secondary"}>
                                        {req.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{req.destination}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        {format(new Date(req.start_date), "MMM d")} - {format(new Date(req.end_date), "MMM d, yyyy")}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground pt-2 border-t mt-2">
                                    Est. Cost: <span className="font-mono text-slate-900">${req.estimated_cost}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
