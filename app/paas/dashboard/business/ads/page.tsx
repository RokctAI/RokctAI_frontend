"use client";

import { format } from "date-fns";
import { Loader2, Plus, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getAdsPackages, getPurchasedAds, purchaseAdsPackage } from "@/app/actions/paas/business";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function AdsPage() {
    const [packages, setPackages] = useState<any[]>([]);
    const [purchasedAds, setPurchasedAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasingId, setPurchasingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [pkgs, ads] = await Promise.all([
                getAdsPackages(),
                getPurchasedAds()
            ]);
            setPackages(pkgs);
            setPurchasedAds(ads);
        } catch (error) {
            console.error("Error fetching ads data:", error);
            toast.error("Failed to load ads data");
        } finally {
            setLoading(false);
        }
    }

    const handlePurchase = async (pkgName: string) => {
        if (!confirm("Are you sure you want to purchase this ad package?")) return;
        setPurchasingId(pkgName);
        try {
            await purchaseAdsPackage(pkgName);
            toast.success("Ad package purchased successfully!");
            fetchData();
        } catch (error) {
            console.error("Error purchasing ad package:", error);
            toast.error("Failed to purchase ad package. Check your subscription eligibility.");
        } finally {
            setPurchasingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Ad Packages</h1>
                <p className="text-muted-foreground">Boost your shop's visibility with our ad packages.</p>
            </div>

            <Tabs defaultValue="available" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="available">Available Packages</TabsTrigger>
                    <TabsTrigger value="purchased">My Ads</TabsTrigger>
                </TabsList>

                <TabsContent value="available" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {packages.map((pkg) => (
                            <Card key={pkg.name} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                                    <CardDescription>Duration: {pkg.duration_days} days</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="text-3xl font-bold">
                                        ${pkg.price}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full"
                                        disabled={!!purchasingId}
                                        onClick={() => handlePurchase(pkg.name)}
                                    >
                                        {purchasingId === pkg.name ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Plus className="mr-2 size-4" />
                                                Purchase
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="purchased">
                    <div className="grid gap-4">
                        {purchasedAds.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                No active ads found.
                            </div>
                        ) : (
                            purchasedAds.map((ad) => (
                                <Card key={ad.name}>
                                    <CardContent className="flex items-center justify-between p-6">
                                        <div>
                                            <div className="font-medium text-lg">{ad.ads_package}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="size-3" />
                                                    Start: {format(new Date(ad.start_date), 'MMM d, yyyy')}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="size-3" />
                                                    End: {format(new Date(ad.end_date), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">Active</Badge>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
