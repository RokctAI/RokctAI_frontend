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
