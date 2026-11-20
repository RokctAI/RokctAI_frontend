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
import Link from "next/link"; // Added
import { RiAddLine } from "@remixicon/react"; // Added
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
import { useRouter } from "next/navigation";
import { createActivityType } from "@/app/actions/handson/all/projects/timesheets";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import tr from "@/app/lib/i18n";
export function ActivityTypeList({ items }: { items: any[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{tr("productivity.activity_types")}</h1>
          <p className="text-muted-foreground">{tr("productivity.billable_work_types")}</p>
        </div>
        <Link href="/handson/all/work_management/projects/activity-type/new">
          <Button>
            <RiAddLine className="mr-2 h-4 w-4" /> {tr("productivity.new_type")}
          </Button>
        </Link>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tr("productivity.activity_type")}</TableHead>
              <TableHead>{tr("productivity.default_rate")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((t) => (
              <TableRow key={t.name}>
                <TableCell>{t.activity_type}</TableCell>
                <TableCell>{t.costing_rate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function ActivityTypeForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [rate, setRate] = useState(0);

  const handleSubmit = async () => {
    const res = await createActivityType({
      activity_type: name,
      costing_rate: rate,
    });
    if (res.success) {
      toast.success("Created");
      router.push("/handson/all/work_management/projects/activity-type");
    } else toast.error(res.error);
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{tr("productivity.new_activity_type")}</h1>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div>
            <Label>{tr("productivity.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>{tr("productivity.rate")}</Label>
            <Input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </div>
          <Button onClick={handleSubmit}>{tr("productivity.save")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
