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

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  getRoutings,
  createRouting,
} from "@/app/actions/handson/all/accounting/manufacturing/routing";

export function RoutingList() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getRoutings().then((d) => {
      setList(d);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="text-center p-4">
        <Loader2 className="animate-spin inline mr-2" />
        Loading...
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Routings</h2>
        <Button
          onClick={() =>
            router.push("/handson/all/supply_chain/manufacturing/routing/new")
          }
        >
          <Plus className="mr-2 h-4 w-4" /> New Routing
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((l) => (
                <TableRow key={l.name}>
                  <TableCell className="font-medium">
                    {l.routing_name}
                  </TableCell>
                  <TableCell>{l.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export function RoutingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    routing_name: "",
    operations: [{ operation: "", workstation: "", time_in_mins: 0 }],
  });

  const handleSubmit = async () => {
    setLoading(true);
    const res = await createRouting(formData);
    if (res.success) {
      toast.success("Routing Created");
      router.push("/handson/all/supply_chain/manufacturing/routing");
    } else toast.error("Failed: " + res.error);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">New Routing</h1>
      </div>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>Routing Name</Label>
            <Input
              value={formData.routing_name}
              onChange={(e) =>
                setFormData({ ...formData, routing_name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Operation Step 1</Label>
            <Input
              placeholder="Operation (e.g. Cutting)"
              value={formData.operations[0].operation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  operations: [
                    { ...formData.operations[0], operation: e.target.value },
                  ],
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Workstation</Label>
            <Input
              placeholder="Workstation"
              value={formData.operations[0].workstation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  operations: [
                    { ...formData.operations[0], workstation: e.target.value },
                  ],
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Time (Mins)</Label>
            <Input
              type="number"
              value={formData.operations[0].time_in_mins}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  operations: [
                    {
                      ...formData.operations[0],
                      time_in_mins: parseFloat(e.target.value),
                    },
                  ],
                })
              }
            />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            Create Routing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
