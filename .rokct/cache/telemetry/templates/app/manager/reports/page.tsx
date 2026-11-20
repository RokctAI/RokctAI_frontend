/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use client";

import {
  RiLoader4Line,
  RiLineChartLine,
  RiShoppingCartLine,
  RiArchiveLine,
  RiMoneyDollarCircleLine,
} from "@remixicon/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getSellerStatistics,
  getOrderReport,
} from "@/app/actions/telemetry/reports";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import t from "@/app/lib/i18n";
export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  async function fetchStatistics() {
    try {
      const data = await getSellerStatistics();
      setStats(data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RiLoader4Line className="size-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t("telemetry.analytics_reports")}</h1>
        <p className="text-muted-foreground">
          {t("telemetry.view_your_shop_s_performance_metrics_and_sales_d")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("telemetry.total_earned")}</CardTitle>
            <RiMoneyDollarCircleLine className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats?.total_earned || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("telemetry.from_delivered_orders")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("telemetry.delivered_orders")}
            </CardTitle>
            <RiShoppingCartLine className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.delivered_orders_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("telemetry.successfully_completed")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("telemetry.in_progress")}</CardTitle>
            <RiLineChartLine className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.progress_orders_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">{t("telemetry.active_orders")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("telemetry.active_products")}
            </CardTitle>
            <RiArchiveLine className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.products_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.products_out_of_count || 0} out of stock
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("telemetry.revenue_breakdown")}</CardTitle>
            <CardDescription>{t("telemetry.earnings_by_category")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("telemetry.delivery_fees")}
              </span>
              <span className="font-medium">
                ${(stats?.delivery_earned || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("telemetry.tax_collected")}
              </span>
              <span className="font-medium">
                ${(stats?.tax_earned || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("telemetry.commission")}</span>
              <span className="font-medium">
                ${(stats?.commission_earned || 0).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("telemetry.top_selling_products")}</CardTitle>
            <CardDescription>{t("telemetry.best_performing_items")}</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.top_selling_products &&
            stats.top_selling_products.length > 0 ? (
              <div className="space-y-3">
                {stats.top_selling_products
                  .slice(0, 5)
                  .map((product: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{product.item_name}</span>
                      <span className="text-sm font-medium">
                        {product.total_quantity} sold
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("telemetry.no_sales_data_available")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
