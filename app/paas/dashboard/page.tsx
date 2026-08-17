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

import {
  Loader2,
  Package,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import t from "@/app/lib/i18n";

import { getDashboardStats } from "@/app/actions/paas/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStats {
  progress_orders_count: number;
  cancel_orders_count: number;
  delivered_orders_count: number;
  products_out_of_count: number;
  products_count: number;
  reviews_count: number;
  total_earned: number;
  delivery_earned: number;
  tax_earned: number;
  commission_earned: number;
  top_selling_products: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center">{t('common.error_load_data')}</div>
    );
  }
  
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">{t('app.paas.dashboard.title')}</h1>


      {/* Order Status Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">
               {t('app.paas.dashboard.stats.in_progress')}
             </CardTitle>
             <ShoppingCart className="size-4 text-muted-foreground" />
           </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.progress_orders_count}
            </div>
          </CardContent>
        </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">
               {t('app.paas.dashboard.stats.cancelled')}
             </CardTitle>
             <XCircle className="size-4 text-red-500" />
           </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.cancel_orders_count}
            </div>
          </CardContent>
        </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">
               {t('app.paas.dashboard.stats.delivered')}
             </CardTitle>
             <CheckCircle className="size-4 text-green-500" />
           </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.delivered_orders_count}
            </div>
          </CardContent>
        </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">{t('app.paas.dashboard.stats.reviews')}</CardTitle>
             <Star className="size-4 text-yellow-500" />
           </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reviews_count}</div>
          </CardContent>
        </Card>
      </div>

      {/* Product Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">
               {t('app.paas.dashboard.stats.total_products')}
             </CardTitle>
             <Package className="size-4 text-muted-foreground" />
           </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products_count}</div>
          </CardContent>
        </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">{t('app.paas.dashboard.stats.out_of_stock')}</CardTitle>
             <AlertCircle className="size-4 text-red-500" />
           </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.products_out_of_count}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">{t('app.paas.dashboard.stats.total_earned')}</CardTitle>
             <DollarSign className="size-4 text-muted-foreground" />
           </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.total_earned || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">
               {t('app.paas.dashboard.stats.delivery_earnings')}
             </CardTitle>
             <DollarSign className="size-4 text-muted-foreground" />
           </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.delivery_earned || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">{t('app.paas.dashboard.stats.tax_collected')}</CardTitle>
             <DollarSign className="size-4 text-muted-foreground" />
           </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.tax_earned || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">
               {t('app.paas.dashboard.stats.commission_paid')}
             </CardTitle>
             <DollarSign className="size-4 text-muted-foreground" />
           </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.commission_earned || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
