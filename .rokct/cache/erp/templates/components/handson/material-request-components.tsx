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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RiAddLine, RiArrowLeftLine, RiLoader4Line } from "@remixicon/react";
import { toast } from "sonner";
import {
  getMaterialRequests,
  createMaterialRequest,
} from "@/app/actions/handson/all/accounting/inventory/logistics";
import { getItems } from "@/app/actions/handson/all/accounting/inventory/item";

import t from "@/app/lib/i18n";
export function MaterialRequestList() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getMaterialRequests().then((data) => {
      setRequests(data);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="text-center p-4">
        <RiLoader4Line className="animate-spin inline mr-2" />
        {t("erp.loading_requests")}
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("erp.material_requests")}</h2>
        <Button
          onClick={() =>
            router.push("/handson/all/supply_chain/stock/material-request/new")
          }
        >
          <RiAddLine className="mr-2 h-4 w-4" /> {t("erp.new_request")}
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("erp.name")}</TableHead>
                <TableHead>{t("erp.type")}</TableHead>
                <TableHead>{t("erp.date")}</TableHead>
                <TableHead>{t("erp.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t("erp.no_material_requests_found")}
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.name}>
                    <TableCell className="font-medium">{req.name}</TableCell>
                    <TableCell>{req.material_request_type}</TableCell>
                    <TableCell>{req.transaction_date}</TableCell>
                    <TableCell>{req.status}</TableCell>
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

export function MaterialRequestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split("T")[0],
    material_request_type: "Purchase",
    items: [
      {
        item_code: "",
        qty: 1,
        schedule_date: new Date().toISOString().split("T")[0],
      },
    ],
  });

  useEffect(() => {
    getItems().then((data) => setItems(data));
  }, []);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { item_code: "", qty: 1, schedule_date: formData.transaction_date },
      ],
    });
  };

  const handleSubmit = async () => {
    if (!formData.items.every((i) => i.item_code)) {
      toast.error("Please select items");
      return;
    }
    setLoading(true);
    const res = await createMaterialRequest(formData);
    if (res.success) {
      toast.success("Material Request Created");
      router.push("/handson/all/supply_chain/stock/material-request");
    } else {
      toast.error("Failed to create request: " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <RiArrowLeftLine className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{t("erp.new_material_request")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("erp.request_details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("erp.date")}</Label>
              <Input
                type="date"
                value={formData.transaction_date}
                onChange={(e) =>
                  setFormData({ ...formData, transaction_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("erp.type")}</Label>
              <Select
                value={formData.material_request_type}
                onValueChange={(v) =>
                  setFormData({ ...formData, material_request_type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Purchase">{t("erp.purchase")}</SelectItem>
                  <SelectItem value="Material Transfer">
                    {t("erp.material_transfer")}
                  </SelectItem>
                  <SelectItem value="Material Issue">{t("erp.material_issue")}</SelectItem>
                  <SelectItem value="Manufacture">{t("erp.manufacture")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{t("erp.items")}</h3>
              <Button variant="outline" size="sm" onClick={handleAddItem}>
                <RiAddLine className="h-4 w-4 mr-2" /> {t("erp.add_item")}
              </Button>
            </div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("erp.item")}</TableHead>
                    <TableHead className="w-[100px]">{t("erp.qty")}</TableHead>
                    <TableHead className="w-[150px]">{t("erp.required_by")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Select
                          value={item.item_code}
                          onValueChange={(v) => {
                            const newItems = [...formData.items];
                            newItems[idx].item_code = v;
                            setFormData({ ...formData, items: newItems });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("erp.select_item")} />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map((i) => (
                              <SelectItem key={i.name} value={i.name}>
                                {i.item_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[idx].qty = parseFloat(e.target.value);
                            setFormData({ ...formData, items: newItems });
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={item.schedule_date}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[idx].schedule_date = e.target.value;
                            setFormData({ ...formData, items: newItems });
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <RiLoader4Line className="animate-spin mr-2" />
            ) : (
              "Create Request"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
