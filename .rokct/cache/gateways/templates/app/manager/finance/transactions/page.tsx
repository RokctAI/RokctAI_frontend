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

import { format } from "date-fns";
import { RiLoader4Line } from "@remixicon/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getTransactions,
  getShopPayments,
  getPartnerPayments,
} from "@/app/actions/gateways/finance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";

import tr from "@/app/lib/i18n";
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [shopPayments, setShopPayments] = useState<any[]>([]);
  const [partnerPayments, setPartnerPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [trx, shop, partner] = await Promise.all([
        getTransactions(),
        getShopPayments(),
        getPartnerPayments(),
      ]);
      setTransactions(trx);
      setShopPayments(shop);
      setPartnerPayments(partner);
    } catch (error) {
      console.error("Error fetching transactions data:", error);
      toast.error("Failed to load transactions data");
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
        <h1 className="text-3xl font-bold">{tr("gateways.transactions")}</h1>
        <p className="text-muted-foreground">
          {tr("gateways.view_your_transaction_history_and_payments")}
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{tr("gateways.all_transactions")}</TabsTrigger>
          <TabsTrigger value="shop">{tr("gateways.shop_payments")}</TabsTrigger>
          <TabsTrigger value="partner">{tr("gateways.partner_payments")}</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>{tr("gateways.all_transactions")}</CardTitle>
              <CardDescription>
                {tr("gateways.a_comprehensive_list_of_all_transactions")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tr("gateways.date")}</TableHead>
                    <TableHead>{tr("gateways.reference")}</TableHead>
                    <TableHead>{tr("gateways.type")}</TableHead>
                    <TableHead className="text-right">{tr("gateways.debit")}</TableHead>
                    <TableHead className="text-right">{tr("gateways.credit")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center h-24 text-muted-foreground"
                      >
                        {tr("gateways.no_transactions_found")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((t) => (
                      <TableRow key={t.name}>
                        <TableCell>
                          {format(new Date(t.transaction_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{t.reference_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {t.reference_doctype}
                          </div>
                        </TableCell>
                        <TableCell>
                          {t.debit > 0 ? "Debit" : "Credit"}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {t.debit > 0 ? formatCurrency(t.debit) : "-"}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {t.credit > 0 ? formatCurrency(t.credit) : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shop">
          <Card>
            <CardHeader>
              <CardTitle>{tr("gateways.shop_payments")}</CardTitle>
              <CardDescription>
                {tr("gateways.payments_received_for_your_shop_orders")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tr("gateways.date")}</TableHead>
                    <TableHead>{tr("gateways.order_id")}</TableHead>
                    <TableHead className="text-right">{tr("gateways.amount")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopPayments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center h-24 text-muted-foreground"
                      >
                        {tr("gateways.no_shop_payments_found")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    shopPayments.map((p) => (
                      <TableRow key={p.name}>
                        <TableCell>
                          {format(new Date(p.transaction_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{p.reference_name}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(p.credit)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partner">
          <Card>
            <CardHeader>
              <CardTitle>{tr("gateways.partner_payments")}</CardTitle>
              <CardDescription>
                {tr("gateways.payments_made_to_delivery_partners")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tr("gateways.date")}</TableHead>
                    <TableHead>{tr("gateways.delivery_man")}</TableHead>
                    <TableHead>{tr("gateways.status")}</TableHead>
                    <TableHead className="text-right">{tr("gateways.amount")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partnerPayments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center h-24 text-muted-foreground"
                      >
                        {tr("gateways.no_partner_payments_found")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    partnerPayments.map((p) => (
                      <TableRow key={p.name}>
                        <TableCell>
                          {format(new Date(p.payment_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{p.deliveryman}</TableCell>
                        <TableCell>{p.status}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(p.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
