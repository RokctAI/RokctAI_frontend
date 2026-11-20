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
import t from "@/app/lib/i18n";
import { getAssetCapitalizations } from "@/app/actions/handson/all/accounting/assets/capitalization/getAssetCapitalizations";
import { createAssetCapitalization } from "@/app/actions/handson/all/accounting/assets/capitalization/createAssetCapitalization";
import { getAssetRepairs } from "@/app/actions/handson/all/accounting/assets/repair/getAssetRepairs";
import { createAssetRepair } from "@/app/actions/handson/all/accounting/assets/repair/createAssetRepair";
import { getAssetMovements } from "@/app/actions/handson/all/accounting/assets/movement/getAssetMovements";
import { createAssetMovement } from "@/app/actions/handson/all/accounting/assets/movement/createAssetMovement";
import { getAssets } from "@/app/actions/handson/all/accounting/assets/getAssets";
import { getItems } from "@/app/actions/handson/all/accounting/inventory/item";

// --- ASSET CAPITALIZATION ---

export function AssetCapitalizationList() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getAssetCapitalizations().then((d) => {
      setList(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>{t("erp.loading")}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("erp.asset_capitalizations")}</h2>
        <Button
          onClick={() =>
            router.push("/handson/all/financials/assets/capitalization/new")
          }
        >
          <RiAddLine className="h-4 w-4 mr-2" /> {t("erp.new_entry")}
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("erp.name")}</TableHead>
                <TableHead>{t("erp.type")}</TableHead>
                <TableHead>{t("erp.target_asset")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((l) => (
                <TableRow key={l.name}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell>{l.entry_type}</TableCell>
                  <TableCell>{l.target_asset}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export function AssetCapitalizationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    entry_type: "Capitalization",
    posting_date: new Date().toISOString().split("T")[0],
    stock_items: [{ item_code: "", qty: 1 }],
  });

  useEffect(() => {
    getItems().then(setItems);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await createAssetCapitalization(formData);
    if (res.success) {
      toast.success("Capitalization Created");
      router.push("/handson/all/financials/assets/capitalization");
    } else toast.error("Failed: " + res.error);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <Button variant="ghost" size="icon" onClick={() => router.back()}>
        <RiArrowLeftLine className="h-4 w-4" />
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{t("erp.new_asset_capitalization")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("erp.posting_date")}</Label>
            <Input
              type="date"
              value={formData.posting_date}
              onChange={(e) =>
                setFormData({ ...formData, posting_date: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("erp.stock_item_to_capitalize")}</Label>
            <Select
              value={formData.stock_items[0].item_code}
              onValueChange={(v) =>
                setFormData({
                  ...formData,
                  stock_items: [{ ...formData.stock_items[0], item_code: v }],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("erp.select_item")} />
              </SelectTrigger>
              <SelectContent>
                {items.map((i) => (
                  <SelectItem key={i.item_code} value={i.item_code}>
                    {i.item_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? <RiLoader4Line className="animate-spin" /> : "Submit"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// --- ASSET REPAIR ---

export function AssetRepairList() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getAssetRepairs().then((d) => {
      setList(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>{t("erp.loading")}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("erp.asset_repairs")}</h2>
        <Button
          onClick={() =>
            router.push("/handson/all/financials/assets/repair/new")
          }
        >
          <RiAddLine className="h-4 w-4 mr-2" /> {t("erp.new_repair")}
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("erp.name")}</TableHead>
                <TableHead>{t("erp.asset")}</TableHead>
                <TableHead>{t("erp.cost")}</TableHead>
                <TableHead>{t("erp.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((l) => (
                <TableRow key={l.name}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell>{l.asset}</TableCell>
                  <TableCell>{l.total_repair_cost}</TableCell>
                  <TableCell>{l.repair_status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export function AssetRepairForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    asset: "",
    failure_date: "",
    description: "",
    total_repair_cost: 0,
  });

  useEffect(() => {
    getAssets().then(setAssets);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await createAssetRepair(formData);
    if (res.success) {
      toast.success("Repair Created");
      router.push("/handson/all/financials/assets/repair");
    } else toast.error("Failed: " + res.error);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <Button variant="ghost" size="icon" onClick={() => router.back()}>
        <RiArrowLeftLine className="h-4 w-4" />
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{t("erp.new_asset_repair")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("erp.asset")}</Label>
            <Select
              value={formData.asset}
              onValueChange={(v) => setFormData({ ...formData, asset: v })}
            >
               <SelectTrigger>
                 <SelectValue placeholder={t('common.select_asset')} />
               </SelectTrigger>
              <SelectContent>
                {assets.map((a) => (
                  <SelectItem key={a.name} value={a.name}>
                    {a.asset_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("erp.failure_date")}</Label>
            <Input
              type="date"
              value={formData.failure_date}
              onChange={(e) =>
                setFormData({ ...formData, failure_date: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("erp.repair_cost")}</Label>
            <Input
              type="number"
              value={formData.total_repair_cost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  total_repair_cost: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("erp.description")}</Label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {t("erp.submit")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// --- ASSET MOVEMENT ---

export function AssetMovementList() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getAssetMovements().then((d) => {
      setList(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>{t("erp.loading")}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("erp.asset_movements")}</h2>
        <Button
          onClick={() =>
            router.push("/handson/all/financials/assets/movement/new")
          }
        >
          <RiAddLine className="h-4 w-4 mr-2" /> {t("erp.new_movement")}
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("erp.name")}</TableHead>
                <TableHead>{t("erp.date")}</TableHead>
                <TableHead>{t("erp.purpose")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((l) => (
                <TableRow key={l.name}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell>{l.transaction_date}</TableCell>
                  <TableCell>{l.purpose}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export function AssetMovementForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split("T")[0],
    purpose: "Transfer",
    assets: [{ asset: "", target_location: "" }],
  });

  useEffect(() => {
    getAssets().then(setAssets);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await createAssetMovement(formData);
    if (res.success) {
      toast.success("Movement Created");
      router.push("/handson/all/financials/assets/movement");
    } else toast.error("Failed: " + res.error);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <Button variant="ghost" size="icon" onClick={() => router.back()}>
        <RiArrowLeftLine className="h-4 w-4" />
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{t("erp.new_asset_movement")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label>{t("erp.asset_to_move")}</Label>
            <Select
              value={formData.assets[0].asset}
              onValueChange={(v) =>
                setFormData({
                  ...formData,
                  assets: [{ ...formData.assets[0], asset: v }],
                })
              }
            >
               <SelectTrigger>
                 <SelectValue placeholder={t('common.select_asset')} />
               </SelectTrigger>
              <SelectContent>
                {assets.map((a) => (
                  <SelectItem key={a.name} value={a.name}>
                    {a.asset_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("erp.target_location")}</Label>
             <Input
               placeholder={t('common.ph_warehouse')}
               value={formData.assets[0].target_location}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  assets: [
                    { ...formData.assets[0], target_location: e.target.value },
                  ],
                })
              }
            />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {t("erp.submit")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
