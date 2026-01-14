"use client";

import { format } from "date-fns";
import { Loader2, MapPin, Package } from "lucide-react";
import { useEffect, useState } from "react";

import { getDeliveryOrders, getParcelOrders } from "@/app/actions/paas/delivery";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DeliveryOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [parcelOrders, setParcelOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            try {
                const [ordersData, parcelOrdersData] = await Promise.all([
                    getDeliveryOrders(),
                    getParcelOrders()
                ]);
                setOrders(ordersData);
                setParcelOrders(parcelOrdersData);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
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
            <h1 className="text-3xl font-bold">My Orders</h1>

            <Tabs defaultValue="food" className="w-full">
                <TabsList>
                    <TabsTrigger value="food">Food Orders</TabsTrigger>
                    <TabsTrigger value="parcel">Parcel Orders</TabsTrigger>
                </TabsList>

                <TabsContent value="food" className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No food orders assigned.</div>
                    ) : (
                        orders.map((order) => (
                            <Card key={order.name}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-medium">
                                        Order #{order.name}
                                    </CardTitle>
                                    <Badge variant={order.status === "Delivered" ? "default" : "secondary"}>
                                        {order.status}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="size-4 text-muted-foreground" />
                                            <span>{order.shop}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-muted-foreground">
                                                {format(new Date(order.creation), "PPP p")}
                                            </span>
                                            <span className="font-bold">${order.total_price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="parcel" className="space-y-4">
                    {parcelOrders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No parcel orders assigned.</div>
                    ) : (
                        parcelOrders.map((order) => (
                            <Card key={order.name}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-medium">
                                        Parcel #{order.name}
                                    </CardTitle>
                                    <Badge variant={order.status === "Delivered" ? "default" : "secondary"}>
                                        {order.status}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Package className="size-4 text-muted-foreground" />
                                            <span>Delivery Date: {order.delivery_date}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="font-bold">${order.total_price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
