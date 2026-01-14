"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DeliveriesMapPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Deliveries Map</h2>
                <p className="text-muted-foreground">
                    Real-time view of active deliveries and driver locations.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Live Map</CardTitle>
                    <CardDescription>
                        Map integration coming soon.
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[500px] flex items-center justify-center bg-muted/20">
                    <p className="text-muted-foreground">Map integration requires Google Maps API key configuration.</p>
                </CardContent>
            </Card>
        </div>
    );
}
