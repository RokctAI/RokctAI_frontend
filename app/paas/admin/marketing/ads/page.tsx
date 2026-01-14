"use client";

import { format } from "date-fns";
import { Loader2, Megaphone } from "lucide-react";
import { useEffect, useState } from "react";

import { getAds } from "@/app/actions/paas/admin/marketing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAdsPage() {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAds() {
            try {
                const data = await getAds();
                setAds(data);
            } catch (error) {
                console.error("Error fetching ads:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchAds();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Ads Management</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ads.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">No ads found.</div>
                ) : (
                    ads.map((ad) => (
                        <Card key={ad.name}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    {ad.title}
                                </CardTitle>
                                <Megaphone className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground mt-2">
                                    <div>Shop: {ad.shop}</div>
                                    <div>Starts: {format(new Date(ad.start_date), "PPP")}</div>
                                    <div>Ends: {format(new Date(ad.end_date), "PPP")}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
