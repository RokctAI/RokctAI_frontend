"use client";

import { Loader2, TrendingUp, ShoppingCart, Package, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getSellerStatistics, getOrderReport } from "@/app/actions/paas/reports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Analytics & Reports</h1>
                <p className="text-muted-foreground">View your shop's performance metrics and sales data.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                        <DollarSign className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(stats?.total_earned || 0).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">From delivered orders</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
                        <ShoppingCart className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.delivered_orders_count || 0}</div>
                        <p className="text-xs text-muted-foreground">Successfully completed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <TrendingUp className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.progress_orders_count || 0}</div>
                        <p className="text-xs text-muted-foreground">Active orders</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                        <Package className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.products_count || 0}</div>
                        <p className="text-xs text-muted-foreground">{stats?.products_out_of_count || 0} out of stock</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Breakdown</CardTitle>
                        <CardDescription>Earnings by category</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Delivery Fees</span>
                            <span className="font-medium">${(stats?.delivery_earned || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Tax Collected</span>
                            <span className="font-medium">${(stats?.tax_earned || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Commission</span>
                            <span className="font-medium">${(stats?.commission_earned || 0).toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Selling Products</CardTitle>
                        <CardDescription>Best performing items</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats?.top_selling_products && stats.top_selling_products.length > 0 ? (
                            <div className="space-y-3">
                                {stats.top_selling_products.slice(0, 5).map((product: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm">{product.item_name}</span>
                                        <span className="text-sm font-medium">{product.total_quantity} sold</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No sales data available</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
