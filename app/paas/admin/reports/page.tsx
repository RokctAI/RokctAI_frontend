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
  BarChart3,
  ShoppingBag,
  Package,
  Layers,
  TrendingUp,
  DollarSign,
  PieChart,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const reports = [
  {
    title: "Products Report",
    description: "Sales performance by product",
    icon: Package,
    href: "/paas/admin/reports/products",
    color: "text-blue-500",
  },
  {
    title: "Orders Report",
    description: "Order volume and status trends",
    icon: ShoppingBag,
    href: "/paas/admin/reports/orders",
    color: "text-green-500",
  },
  {
    title: "Stock Report",
    description: "Inventory levels and low stock alerts",
    icon: Layers,
    href: "/paas/admin/reports/stock",
    color: "text-orange-500",
  },
  {
    title: "Categories Report",
    description: "Performance by product category",
    icon: PieChart,
    href: "/paas/admin/reports/categories",
    color: "text-purple-500",
  },
  {
    title: "Overview Report",
    description: "High-level system metrics",
    icon: BarChart3,
    href: "/paas/admin/reports/overview",
    color: "text-indigo-500",
  },
  {
    title: "Revenue Report",
    description: "Financial performance and earnings",
    icon: DollarSign,
    href: "/paas/admin/reports/revenue",
    color: "text-emerald-500",
  },
  {
    title: "Variation Report",
    description: "Sales by product variations/extras",
    icon: TrendingUp,
    href: "/paas/admin/reports/variation",
    color: "text-pink-500",
  },
];

export default function ReportsOverviewPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Analytics & Reports</h1>
      <p className="text-muted-foreground">
        Select a report to view detailed analytics.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {reports.map((report) => (
          <Link key={report.title} href={report.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                  {report.title}
                </CardTitle>
                <report.icon className={`size-5 ${report.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mt-2">
                  {report.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
