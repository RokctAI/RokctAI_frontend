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

import { Loader2, Users, ChefHat, Bike } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getWaiters, getCooks, getDeliveryMen } from "@/app/actions/paas/staff";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import t from "@/app/lib/i18n";

export default function StaffPage() {
  const [waiters, setWaiters] = useState<any[]>([]);
  const [cooks, setCooks] = useState<any[]>([]);
  const [deliveryMen, setDeliveryMen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllStaff();
  }, []);

  async function fetchAllStaff() {
    try {
      const [waitersData, cooksData, deliveryData] = await Promise.all([
        getWaiters(),
        getCooks(),
        getDeliveryMen(),
      ]);
      setWaiters(waitersData);
      setCooks(cooksData);
      setDeliveryMen(deliveryData);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  }

  const StaffList = ({
    staff,
    emptyMessage,
  }: {
    staff: any[];
    emptyMessage: string;
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {staff.length === 0 ? (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        staff.map((member) => (
          <Card key={member.name}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-12">
                  <AvatarImage src={member.user_image} alt={member.full_name} />
                  <AvatarFallback>
                    {member.full_name?.charAt(0) || member.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {member.full_name || member.email}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

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
        <h1 className="text-3xl font-bold">
          {t("app.paas.dashboard.restaurant.staff.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("app.paas.dashboard.restaurant.staff.desc")}
        </p>
      </div>

      <Tabs defaultValue="waiters" className="space-y-4">
        <TabsList>
          <TabsTrigger value="waiters" className="flex items-center gap-2">
            <Users className="size-4" />
            {t("app.paas.dashboard.restaurant.staff.waiters")} ({waiters.length}
            )
          </TabsTrigger>
          <TabsTrigger value="cooks" className="flex items-center gap-2">
            <ChefHat className="size-4" />
            {t("app.paas.dashboard.restaurant.staff.cooks")} ({cooks.length})
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Bike className="size-4" />
            {t("app.paas.dashboard.restaurant.staff.delivery")} (
            {deliveryMen.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="waiters">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("app.paas.dashboard.restaurant.staff.waiters")}
              </CardTitle>
              <CardDescription>
                {t("app.paas.dashboard.restaurant.staff.waiters_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaffList
                staff={waiters}
                emptyMessage={t(
                  "app.paas.dashboard.restaurant.staff.waiters_empty",
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cooks">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("app.paas.dashboard.restaurant.staff.cooks")}
              </CardTitle>
              <CardDescription>
                {t("app.paas.dashboard.restaurant.staff.cooks_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaffList
                staff={cooks}
                emptyMessage={t(
                  "app.paas.dashboard.restaurant.staff.cooks_empty",
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("app.paas.dashboard.restaurant.staff.delivery_title")}
              </CardTitle>
              <CardDescription>
                {t("app.paas.dashboard.restaurant.staff.delivery_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaffList
                staff={deliveryMen}
                emptyMessage={t(
                  "app.paas.dashboard.restaurant.staff.delivery_empty",
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
