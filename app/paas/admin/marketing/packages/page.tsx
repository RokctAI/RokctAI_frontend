"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getShopAdsPackages } from "@/app/actions/paas/admin/marketing";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdsPackagesPage() {
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPackages() {
            try {
                const data = await getShopAdsPackages();
                setPackages(data);
            } catch (error) {
                console.error("Error fetching packages:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPackages();
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
            <h1 className="text-3xl font-bold">Shop Ads Packages</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {packages.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        No packages found.
                    </div>
                ) : (
                    packages.map((pkg) => (
                        <Card key={pkg.name}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle>{pkg.package_name}</CardTitle>
                                    <Badge variant={pkg.active ? "default" : "secondary"}>
                                        {pkg.active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-2xl font-bold">${pkg.price}</div>
                                <p className="text-sm text-muted-foreground">Duration: {pkg.duration_days} days</p>
                                <p className="text-sm text-muted-foreground">Max Ads: {pkg.max_ads}</p>
                                <p className="text-sm mt-4">{pkg.description}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
