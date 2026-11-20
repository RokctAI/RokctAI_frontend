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

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RiAddLine, RiSearchLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import t from "@/app/lib/i18n";
export function SubcontractingOrderList({ orders }: { orders: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = orders.filter((o) =>
    o.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("erp.subcontracting_orders")}</h1>
          <p className="text-muted-foreground">{t("erp.manage_outsourcing_jobs")}</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-64">
            <RiSearchLine className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("erp.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Link href="/handson/all/supply_chain/subcontracting/order/new">
            <Button>
              <RiAddLine className="mr-2 h-4 w-4" /> {t("erp.new_order")}
            </Button>
          </Link>
        </div>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("erp.name")}</TableHead>
              <TableHead>{t("erp.supplier")}</TableHead>
              <TableHead>{t("erp.date")}</TableHead>
              <TableHead>{t("erp.status")}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => (
              <TableRow key={o.name}>
                <TableCell className="font-medium">{o.name}</TableCell>
                <TableCell>{o.supplier}</TableCell>
                <TableCell>{o.transaction_date}</TableCell>
                <TableCell>
                  <Badge variant="outline">{o.status}</Badge>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/handson/all/supply_chain/subcontracting/order/${o.name}`}
                  >
                    <Button variant="ghost" size="sm">
                      {t("erp.view")}
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
