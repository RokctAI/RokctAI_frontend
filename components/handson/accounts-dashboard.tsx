
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceList } from "./invoice-list";
import { PurchaseInvoiceList } from "./purchase-invoice-list";

interface AccountsDashboardProps {
    salesInvoices: any[];
    purchaseInvoices: any[];
}

export function AccountsDashboard({ salesInvoices, purchaseInvoices }: AccountsDashboardProps) {
    return (
        <Tabs defaultValue="sales" className="w-full space-y-4">
            <TabsList>
                <TabsTrigger value="sales">Sales Invoices</TabsTrigger>
                <TabsTrigger value="purchase">Purchase Invoices (Bills)</TabsTrigger>
            </TabsList>
            <TabsContent value="sales">
                <InvoiceList invoices={salesInvoices} />
            </TabsContent>
            <TabsContent value="purchase">
                <PurchaseInvoiceList invoices={purchaseInvoices} />
            </TabsContent>
        </Tabs>
    );
}
