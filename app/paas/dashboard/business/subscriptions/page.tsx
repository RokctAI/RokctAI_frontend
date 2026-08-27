/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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

import { Loader2, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getSubscriptions,
  getMyShopSubscription,
  subscribeMyShop,
} from "@/app/actions/paas/business";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils"; // Assuming this utility exists or I'll create a simple helper

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [subs, mySub] = await Promise.all([
        getSubscriptions(),
        getMyShopSubscription(),
      ]);
      setSubscriptions(subs);
      setCurrentSubscription(mySub);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }

  const handleSubscribe = async (subId: string) => {
    if (!confirm("Are you sure you want to subscribe to this plan?")) return;
    setProcessingId(subId);
    try {
      await subscribeMyShop(subId);
      toast.success("Successfully subscribed!");
      fetchData();
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Failed to subscribe");
    } finally {
      setProcessingId(null);
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
      <div>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground">
          Choose a plan that fits your business needs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((sub) => {
          const isCurrent =
            currentSubscription?.subscription === sub.name &&
            currentSubscription?.active === 1;
          return (
            <Card
              key={sub.name}
              className={`relative flex flex-col ${isCurrent ? "border-primary shadow-lg" : ""}`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    Current Plan
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">
                  {sub.title || sub.name}
                </CardTitle>
                <CardDescription>{sub.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="text-3xl font-bold">
                  ${sub.price}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {sub.month} month(s)
                  </span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-green-500" />
                    <span>Order Limit: {sub.order_limit}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-green-500" />
                    <span>Product Limit: {sub.product_limit}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {sub.with_report ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      <span className="w-4" />
                    )}
                    <span>
                      {sub.with_report ? "Includes Reports" : "No Reports"}
                    </span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent || !!processingId}
                  onClick={() => handleSubscribe(sub.name)}
                >
                  {processingId === sub.name ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : isCurrent ? (
                    "Active"
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
