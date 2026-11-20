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
import { RiAddLine } from "@remixicon/react";
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
import { useRouter } from "next/navigation";
import { createProductionPlan } from "@/app/actions/handson/all/accounting/manufacturing/production_plan";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import t from "@/app/lib/i18n";
export function ProductionPlanList({ plans }: { plans: any[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("erp.production_plans")}</h1>
          <p className="text-muted-foreground">{t("erp.plan_manufacturing_batches")}</p>
        </div>
        <Link href="/handson/all/supply_chain/manufacturing/production-plan/new">
          <Button>
            <RiAddLine className="mr-2 h-4 w-4" /> {t("erp.new_plan")}
          </Button>
        </Link>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("erp.name")}</TableHead>
              <TableHead>{t("erp.company")}</TableHead>
              <TableHead>{t("erp.date")}</TableHead>
              <TableHead>{t("erp.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((p) => (
              <TableRow key={p.name}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.company}</TableCell>
                <TableCell>{p.posting_date}</TableCell>
                <TableCell>
                  <Badge variant="outline">{p.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function ProductionPlanForm() {
  const router = useRouter();
  const [item, setItem] = useState("");
  const [qty, setQty] = useState(1);

  const handleSubmit = async () => {
    const res = await createProductionPlan({
      company: "Juvo",
      posting_date: new Date().toISOString().split("T")[0],
      po_items: [{ item_code: item, planned_qty: qty }],
    });
    if (res.success) {
      toast.success("Plan Created");
      router.push("/handson/all/supply_chain/manufacturing/production-plan");
    } else toast.error(res.error);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t("erp.new_production_plan")}</h1>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>{t("erp.item_code")}</Label>
              <Input value={item} onChange={(e) => setItem(e.target.value)} />
            </div>
            <div className="w-32">
              <Label>{t("erp.planned_qty")}</Label>
              <Input
                type="number"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>
          </div>
          <Button onClick={handleSubmit}>{t("erp.create_plan")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
