"use client";

import { format } from "date-fns";
import { Loader2, Trash2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getReviews, deleteReview } from "@/app/actions/paas/admin/support";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    async function fetchReviews() {
        try {
            const data = await getReviews();
            setReviews(data);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (name: string) => {
        if (!confirm("Delete this review?")) return;
        try {
            await deleteReview(name);
            toast.success("Review deleted");
            fetchReviews();
        } catch (error) {
            toast.error("Failed to delete review");
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
            <h1 className="text-3xl font-bold">Reviews</h1>

            <div className="grid gap-4 md:grid-cols-2">
                {reviews.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">No reviews found.</div>
                ) : (
                    reviews.map((review) => (
                        <Card key={review.name}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`size-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                        />
                                    ))}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600 -mt-2 -mr-2"
                                    onClick={() => handleDelete(review.name)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm mb-2">{review.comment}</p>
                                <div className="text-xs text-muted-foreground">
                                    By {review.user} on {format(new Date(review.creation), "PPP")}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    For {review.reviewable_type}: {review.reviewable_id}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
