
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PurchaseOrderList } from "./purchase-order-list";
import { SupplierList } from "./supplier-list";

interface BuyingDashboardProps {
    orders: any[];
    suppliers: any[];
    canEdit: boolean;
}

export function BuyingDashboard({ orders, suppliers, canEdit }: BuyingDashboardProps) {
    return (
        <Tabs defaultValue="orders" className="w-full space-y-4">
            <TabsList>
                <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
                <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            </TabsList>
            <TabsContent value="orders">
                <PurchaseOrderList orders={orders} canEdit={canEdit} />
            </TabsContent>
            <TabsContent value="suppliers">
                <SupplierList suppliers={suppliers} />
            </TabsContent>
        </Tabs>
    );
}
