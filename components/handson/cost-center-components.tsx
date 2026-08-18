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
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
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
import { createCostCenter } from "@/app/actions/handson/all/accounting/cost_centers/createCostCenter";
import { toast } from "sonner";
import t from "@/app/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function CostCenterList({ items }: { items: any[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cost Centers</h1>
          <p className="text-muted-foreground">
            Track profitability by department/project.
          </p>
        </div>
        <Link href="/handson/all/financials/accounts/cost-center/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Cost Center
          </Button>
        </Link>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Parent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((t) => (
              <TableRow key={t.name}>
                <TableCell>{t.cost_center_name}</TableCell>
                <TableCell>{t.parent_cost_center}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function CostCenterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");

  const handleSubmit = async () => {
    const res = await createCostCenter({
      cost_center_name: name,
      parent_cost_center: parent,
      company: "Juvo",
    });
    if (res.success) {
      toast.success("Created");
      router.push("/handson/all/financials/accounts/cost-center");
    } else toast.error(res.error);
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">New Cost Center</h1>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Parent Cost Center</Label>
            <Input
              value={parent}
              onChange={(e) => setParent(e.target.value)}
              placeholder={t("common.ph_cost_center")}
            />
          </div>
          <Button onClick={handleSubmit}>Save</Button>
        </CardContent>
      </Card>
    </div>
  );
}
