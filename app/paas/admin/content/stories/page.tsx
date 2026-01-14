"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { getStories } from "@/app/actions/paas/admin/content";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminStoriesPage() {
    const [stories, setStories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStories() {
            try {
                const data = await getStories();
                setStories(data);
            } catch (error) {
                console.error("Error fetching stories:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStories();
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
            <h1 className="text-3xl font-bold">Stories</h1>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                {stories.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        No stories found.
                    </div>
                ) : (
                    stories.map((story) => (
                        <Card key={story.name} className="overflow-hidden h-64 relative group cursor-pointer">
                            {story.file_url ? (
                                <Image
                                    src={story.file_url}
                                    alt="Story"
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                />
                            ) : (
                                <div className="size-full bg-muted flex items-center justify-center">
                                    No Media
                                </div>
                            )}
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-white text-xs truncate">
                                {story.shop}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
