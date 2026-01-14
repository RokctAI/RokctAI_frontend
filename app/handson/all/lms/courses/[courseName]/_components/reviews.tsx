"use client";

import { useEffect, useState } from "react";
import { fetchCourseReviews, createReviewAction, checkReviewStatus } from "@/app/actions/handson/all/lms/reviews/actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatDate } from "@/app/lib/format";

interface ReviewsProps {
    courseName: string;
    currentUser: string; // email or username to check if reviewed
}

export function Reviews({ courseName, currentUser }: ReviewsProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [open, setOpen] = useState(false);

    // Form
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, [courseName]);

    async function loadData() {
        setLoading(true);
        try {
            const [data, reviewed] = await Promise.all([
                fetchCourseReviews(courseName),
                checkReviewStatus(courseName, currentUser)
            ]);
            if (Array.isArray(data)) setReviews(data);
            setHasReviewed(reviewed);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit() {
        if (rating === 0) return toast.error("Please select a rating");
        setSubmitting(true);
        try {
            const res = await createReviewAction(courseName, rating, reviewText);
            if (res.success) {
                toast.success("Review submitted");
                setOpen(false);
                loadData();
            } else {
                toast.error("Failed to submit review");
            }
        } catch (err) {
            toast.error("Error submitting review");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">Student Reviews</h3>
                {!hasReviewed && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>Write a Review</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Rate this Course</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                <div className="space-y-2 flex flex-col items-center">
                                    <Label>Rating</Label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={`transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                            >
                                                <Star className="w-8 h-8 fill-current" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Review (Optional)</Label>
                                    <Textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="Share your experience..."
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? "Submitting..." : "Submit Review"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {loading ? (
                <div className="text-sm text-muted-foreground">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg text-gray-500">
                    No reviews yet.
                </div>
            ) : (
                <div className="grid gap-6">
                    {reviews.map((review: any) => (
                        <div key={review.name} className="flex gap-4 p-4 border rounded-lg bg-card">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={review.user_image || review.owner_image} />
                                <AvatarFallback>{review.owner?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{review.fullname || review.owner}</span>
                                    <span className="text-xs text-muted-foreground">{formatDate(review.creation)}</span>
                                </div>
                                <div className="flex text-yellow-400 w-fit">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(review.rating) ? 'fill-current' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                                {review.review && <p className="text-sm text-gray-600 mt-2">{review.review}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
