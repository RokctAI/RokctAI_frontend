/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import t from "@/app/lib/i18n";

import { getParcelOrders, updateParcelStatus } from "@/app/actions/paas/parcel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ParcelOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  async function fetchOrders() {
    setLoading(true);
    try {
      const data = await getParcelOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching parcel orders:", error);
      toast.error(t("app.paas.dashboard.orders.parcels.toast_load_fail"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  async function handleStatusUpdate(name: string, status: string) {
    try {
      await updateParcelStatus(name, status);
      toast.success(
        t("app.paas.dashboard.orders.parcels.toast_update_success", { status }),
      );
      fetchOrders();
    } catch (error) {
      toast.error(t("app.paas.dashboard.orders.parcels.toast_update_fail"));
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t("app.paas.dashboard.orders.parcels.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("app.paas.dashboard.orders.parcels.desc")}
          </p>
        </div>
        <div className="w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue
                placeholder={t("app.paas.dashboard.orders.parcels.ph_filter")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("app.paas.dashboard.orders.parcels.status_all")}
              </SelectItem>
              <SelectItem value="New">
                {t("app.paas.dashboard.orders.parcels.status_new")}
              </SelectItem>
              <SelectItem value="Accepted">
                {t("app.paas.dashboard.orders.parcels.status_accepted")}
              </SelectItem>
              <SelectItem value="Ready">
                {t("app.paas.dashboard.orders.parcels.status_ready")}
              </SelectItem>
              <SelectItem value="On a way">
                {t("app.paas.dashboard.orders.parcels.status_on_way")}
              </SelectItem>
              <SelectItem value="Delivered">
                {t("app.paas.dashboard.orders.parcels.status_delivered")}
              </SelectItem>
              <SelectItem value="Canceled">
                {t("app.paas.dashboard.orders.parcels.status_canceled")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("app.paas.dashboard.orders.parcels.card_title")}
          </CardTitle>
          <CardDescription>
            {t("app.paas.dashboard.orders.parcels.card_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("app.paas.dashboard.orders.parcels.col_order_id")}
                </TableHead>
                <TableHead>
                  {t("app.paas.dashboard.orders.parcels.col_date")}
                </TableHead>
                <TableHead>
                  {t("app.paas.dashboard.orders.parcels.col_destination")}
                </TableHead>
                <TableHead>
                  {t("app.paas.dashboard.orders.parcels.col_price")}
                </TableHead>
                <TableHead>
                  {t("app.paas.dashboard.orders.parcels.col_status")}
                </TableHead>
                <TableHead className="text-right">
                  {t("app.paas.dashboard.orders.parcels.col_actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center h-24 text-muted-foreground"
                  >
                    {t("app.paas.dashboard.orders.parcels.no_orders")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.name}>
                    <TableCell className="font-medium">{order.name}</TableCell>
                    <TableCell>
                      {order.delivery_date
                        ? format(new Date(order.delivery_date), "MMM d, yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell
                      className="max-w-[200px] truncate"
                      title={order.address_to}
                    >
                      {order.address_to}
                    </TableCell>
                    <TableCell>{order.total_price}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "Delivered"
                            ? "default"
                            : order.status === "Canceled"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {order.status === "New" && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() =>
                                handleStatusUpdate(order.name, "Accepted")
                              }
                              title="Accept"
                            >
                              <CheckCircle className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() =>
                                handleStatusUpdate(order.name, "Canceled")
                              }
                              title="Cancel"
                            >
                              <XCircle className="size-4" />
                            </Button>
                          </>
                        )}
                        <Link
                          href={`/paas/dashboard/orders/parcels/${order.name}`}
                        >
                          <Button variant="ghost" size="icon">
                            <Eye className="size-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
