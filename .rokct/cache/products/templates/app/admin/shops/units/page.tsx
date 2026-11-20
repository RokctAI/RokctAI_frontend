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
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { getShopUnits } from "@/app/actions/merchants/admin/shops";
import { Badge } from "@/components/ui/badge";
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

import t from "@/app/lib/i18n";
export default function ShopUnitsPage() {
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    loadUnits();
  }, []);

  async function loadUnits() {
    try {
      const data = await getShopUnits();
      setUnits(data);
    } catch (error) {
      toast.error("Failed to load shop units");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RiLoader4Line className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("products.shop_units")}</h2>
        <p className="text-muted-foreground">
          {t("products.view_all_shop_units_registered_in_the_system")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("products.all_units")}</CardTitle>
          <CardDescription>
            {t("products.list_of_units_e_g_kg_pcs_used_by_shops")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("products.name")}</TableHead>
                <TableHead>{t("products.shop")}</TableHead>
                <TableHead>{t("products.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => (
                <TableRow key={unit.name}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>{unit.shop}</TableCell>
                  <TableCell>
                    <Badge variant={unit.active ? "default" : "secondary"}>
                      {unit.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {units.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t("products.no_shop_units_found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
