"use client";

import { format } from "date-fns";
import { Loader2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

import { getBlogs } from "@/app/actions/paas/admin/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBlogs() {
            try {
                const data = await getBlogs();
                setBlogs(data);
            } catch (error) {
                console.error("Error fetching blogs:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBlogs();
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
            <h1 className="text-3xl font-bold">Blogs</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {blogs.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        No blogs found.
                    </div>
                ) : (
                    blogs.map((blog) => (
                        <Card key={blog.name} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                                <div className="flex items-center text-sm text-muted-foreground mt-2">
                                    <Calendar className="mr-2 size-4" />
                                    {format(new Date(blog.published_on || blog.creation), "PPP")}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {blog.short_description}
                                </p>
                                <div className="mt-4 flex gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs ${blog.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {blog.published ? "Published" : "Draft"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
