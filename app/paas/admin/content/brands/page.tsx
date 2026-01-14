"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { getBrands } from "@/app/actions/paas/admin/content";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminBrandsPage() {
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBrands() {
            try {
                const data = await getBrands();
                setBrands(data);
            } catch (error) {
                console.error("Error fetching brands:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBrands();
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
            <h1 className="text-3xl font-bold">Brands</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {brands.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        No brands found.
                    </div>
                ) : (
                    brands.map((brand) => (
                        <Card key={brand.name} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <CardContent className="p-4 flex flex-col items-center">
                                <div className="relative size-24 mb-4">
                                    {brand.image ? (
                                        <Image
                                            src={brand.image}
                                            alt={brand.title}
                                            fill
                                            className="object-contain"
                                        />
                                    ) : (
                                        <div className="size-full bg-muted rounded-full flex items-center justify-center text-xs text-muted-foreground">
                                            No Logo
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-medium text-center truncate w-full" title={brand.title}>
                                    {brand.title}
                                </h3>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
