/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use client";

import { format } from "date-fns";
import { Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";

import { getOrderReviews } from "@/app/actions/paas/admin/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await getOrderReviews();
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
      <h1 className="text-3xl font-bold">Order Reviews</h1>

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
                  Order #{review.order}
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
                    <span>{review.user}</span>
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
