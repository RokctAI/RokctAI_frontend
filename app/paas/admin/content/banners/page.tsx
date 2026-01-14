"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { getBanners } from "@/app/actions/paas/admin/content";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBanners() {
            try {
                const data = await getBanners();
                setBanners(data);
            } catch (error) {
                console.error("Error fetching banners:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBanners();
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
            <h1 className="text-3xl font-bold">Banners</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {banners.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        No banners found.
                    </div>
                ) : (
                    banners.map((banner) => (
                        <Card key={banner.name} className="overflow-hidden">
                            <div className="relative w-full h-48">
                                {banner.img ? (
                                    <Image
                                        src={banner.img}
                                        alt={banner.description || "Banner"}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="size-full bg-muted flex items-center justify-center text-muted-foreground">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-medium">{banner.description || "No Description"}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Type: {banner.type}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Active: {banner.active ? "Yes" : "No"}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
