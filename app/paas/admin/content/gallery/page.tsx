"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { getGallery } from "@/app/actions/paas/admin/content";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminGalleryPage() {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGallery() {
            try {
                const data = await getGallery();
                setImages(data);
            } catch (error) {
                console.error("Error fetching gallery:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchGallery();
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
            <h1 className="text-3xl font-bold">Shop Gallery</h1>

            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                {images.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        No images found.
                    </div>
                ) : (
                    images.map((img) => (
                        <Card key={img.name} className="overflow-hidden">
                            <div className="relative w-full h-48">
                                <Image
                                    src={img.image}
                                    alt={img.description || "Gallery Image"}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <CardContent className="p-4">
                                <p className="text-sm font-medium">{img.shop}</p>
                                <p className="text-xs text-muted-foreground">{img.description}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
