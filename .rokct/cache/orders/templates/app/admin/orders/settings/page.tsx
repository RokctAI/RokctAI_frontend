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

import { RiLoader4Line } from "@remixicon/react";
import { useEffect, useState } from "react";

import { getOrderStatuses } from "@/app/actions/orders/admin/orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import t from "@/app/lib/i18n";
export default function OrderStatusSettingsPage() {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatuses() {
      try {
        const data = await getOrderStatuses();
        setStatuses(data);
      } catch (error) {
        console.error("Error fetching order statuses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStatuses();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">{t("orders.order_status_settings")}</h1>
      <p className="text-muted-foreground">
        {t("orders.manage_the_available_statuses_for_orders")}
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("orders.status_name")}</TableHead>
              <TableHead>{t("orders.color")}</TableHead>
              <TableHead>{t("orders.active")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <RiLoader4Line className="size-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : statuses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t("orders.no_order_statuses_found")}
                </TableCell>
              </TableRow>
            ) : (
              statuses.map((status) => (
                <TableRow key={status.name}>
                  <TableCell className="font-medium">{status.status}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="size-4 rounded-full border"
                        style={{ backgroundColor: status.color || "#ccc" }}
                      />
                      {status.color}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.active ? "default" : "secondary"}>
                      {status.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
