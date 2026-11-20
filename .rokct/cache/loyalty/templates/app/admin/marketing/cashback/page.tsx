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

import { getCashbackRules } from "@/app/actions/promotions/admin/marketing";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import t from "@/app/lib/i18n";
export default function CashbackRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRules() {
      try {
        const data = await getCashbackRules();
        setRules(data);
      } catch (error) {
        console.error("Error fetching cashback rules:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRules();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">{t("loyalty.cashback_rules")}</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("loyalty.name")}</TableHead>
              <TableHead>{t("loyalty.type")}</TableHead>
              <TableHead>{t("loyalty.amount")}</TableHead>
              <TableHead>{t("loyalty.min_order")}</TableHead>
              <TableHead>{t("loyalty.active")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <RiLoader4Line className="size-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : rules.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t("loyalty.no_cashback_rules_found")}
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.name}>
                  <TableCell className="font-medium">
                    {rule.rule_name}
                  </TableCell>
                  <TableCell>{rule.type}</TableCell>
                  <TableCell>
                    {rule.type === "Percentage"
                      ? `${rule.amount}%`
                      : `$${rule.amount}`}
                  </TableCell>
                  <TableCell>${rule.min_order_amount}</TableCell>
                  <TableCell>
                    <Badge variant={rule.active ? "default" : "secondary"}>
                      {rule.active ? "Active" : "Inactive"}
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
