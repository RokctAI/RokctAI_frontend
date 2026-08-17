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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceList } from "./invoice-list";
import { PurchaseInvoiceList } from "./purchase-invoice-list";

interface AccountsDashboardProps {
  salesInvoices: any[];
  purchaseInvoices: any[];
}

export function AccountsDashboard({
  salesInvoices,
  purchaseInvoices,
}: AccountsDashboardProps) {
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
