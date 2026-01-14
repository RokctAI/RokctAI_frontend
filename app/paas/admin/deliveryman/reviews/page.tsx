"use client";

import { format } from "date-fns";
import { Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";

import { getDeliverymanReviews } from "@/app/actions/paas/admin/deliveryman";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DeliverymanReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReviews() {
            try {
                const data = await getDeliverymanReviews();
                setReviews(data);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
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
            <h1 className="text-3xl font-bold">Deliveryman Reviews</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reviews.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        No reviews found.
                    </div>
                ) : (
                    reviews.map((review) => (
                        <Card key={review.name}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    {review.driver_name}
                                </CardTitle>
                                <div className="flex items-center text-yellow-500">
                                    <span className="font-bold mr-1">{review.rating}</span>
                                    <Star className="size-4 fill-current" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground mt-2">
                                    <p className="italic">"{review.comment}"</p>
                                    <div className="mt-4 flex justify-between text-xs">
                                        <span>Order #{review.order}</span>
                                        <span>{format(new Date(review.creation), "PPP")}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
