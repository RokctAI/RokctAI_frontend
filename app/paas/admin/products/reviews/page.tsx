"use client";

import { format } from "date-fns";
import { Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";

import { getAllProductReviews } from "@/app/actions/paas/admin/products";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ProductReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReviews() {
            try {
                const data = await getAllProductReviews();
                setReviews(data);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Product Reviews</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Comment</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="size-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : reviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No reviews found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reviews.map((review) => (
                                <TableRow key={review.name}>
                                    <TableCell>{format(new Date(review.creation), "PPP")}</TableCell>
                                    <TableCell>{review.product}</TableCell>
                                    <TableCell>{review.user}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Star className="size-4 fill-yellow-400 text-yellow-400 mr-1" />
                                            {review.rating}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-md truncate">{review.comment}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
