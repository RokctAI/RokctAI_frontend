/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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

import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getParcelSettings,
  createParcelSetting,
  updateParcelSetting,
  deleteParcelSetting,
} from "@/app/actions/paas/parcel";
import { ImageUpload } from "@/components/custom/image-upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import t from "@/app/lib/i18n";

export default function ParcelSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    type: "",
    img: "",
    min_g: 0,
    max_g: 0,
    price: 0,
    price_per_km: 0,
    special: 0,
    special_price: 0,
    special_price_per_km: 0,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const data = await getParcelSettings();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching parcel settings:", error);
      toast.error("Failed to load parcel settings");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDialog = (setting?: any) => {
    if (setting) {
      setEditing(setting);
      setFormData({
        type: setting.type || "",
        img: setting.img || "",
        min_g: setting.min_g || 0,
        max_g: setting.max_g || 0,
        price: setting.price || 0,
        price_per_km: setting.price_per_km || 0,
        special: setting.special || 0,
        special_price: setting.special_price || 0,
        special_price_per_km: setting.special_price_per_km || 0,
      });
    } else {
      setEditing(null);
      setFormData({
        type: "",
        img: "",
        min_g: 0,
        max_g: 0,
        price: 0,
        price_per_km: 0,
        special: 0,
        special_price: 0,
        special_price_per_km: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.type) {
      toast.error("Type is required");
      return;
    }

    setProcessing(true);
    try {
      if (editing) {
        await updateParcelSetting(editing.name, formData);
        toast.success("Setting updated successfully");
      } else {
        await createParcelSetting(formData);
        toast.success("Setting created successfully");
      }
      setIsDialogOpen(false);
      fetchSettings();
    } catch (error) {
      console.error("Error saving setting:", error);
      toast.error("Failed to save setting");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm("Are you sure you want to delete this setting?")) return;
    try {
      await deleteParcelSetting(name);
      toast.success("Setting deleted successfully");
      fetchSettings();
    } catch (error) {
      console.error("Error deleting setting:", error);
      toast.error("Failed to delete setting");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {t("app.paas.dashboard.settings.parcel.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("app.paas.dashboard.settings.parcel.desc")}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 size-4" />{" "}
          {t("app.paas.dashboard.settings.parcel.btn_add")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("app.paas.dashboard.settings.parcel.card_title")}
          </CardTitle>
          <CardDescription>
            {t("app.paas.dashboard.settings.parcel.card_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("app.paas.dashboard.settings.parcel.col_type")}
                </TableHead>
                <TableHead>
                  {t("app.paas.dashboard.settings.parcel.col_weight")}
                </TableHead>
                <TableHead>
                  {t("app.paas.dashboard.settings.parcel.col_base_price")}
                </TableHead>
                <TableHead>
                  {t("app.paas.dashboard.settings.parcel.col_price_km")}
                </TableHead>
                <TableHead>
                  {t("app.paas.dashboard.settings.parcel.col_special")}
                </TableHead>
                <TableHead className="text-right">
                  {t("common.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center h-24 text-muted-foreground"
                  >
                    {t("app.paas.dashboard.settings.parcel.no_data")}
                  </TableCell>
                </TableRow>
              ) : (
                settings.map((setting) => (
                  <TableRow key={setting.name}>
                    <TableCell className="font-medium">
                      {setting.type}
                    </TableCell>
                    <TableCell>
                      {setting.min_g} - {setting.max_g}
                    </TableCell>
                    <TableCell>${setting.price.toFixed(2)}</TableCell>
                    <TableCell>${setting.price_per_km.toFixed(2)}</TableCell>
                    <TableCell>
                      {setting.special ? t("common.yes") : t("common.no")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(setting)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(setting.name)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? t("app.paas.dashboard.settings.parcel.dialog_edit")
                : t("app.paas.dashboard.settings.parcel.dialog_add")}
            </DialogTitle>
            <DialogDescription>
              {t("app.paas.dashboard.settings.parcel.dialog_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">
                {t("app.paas.dashboard.settings.parcel.label_type")}
              </Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
                }
                placeholder={t("app.paas.dashboard.settings.parcel.ph_type")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="min_g">
                  {t("app.paas.dashboard.settings.parcel.label_min_g")}
                </Label>
                <Input
                  id="min_g"
                  type="number"
                  value={formData.min_g}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      min_g: parseFloat(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max_g">
                  {t("app.paas.dashboard.settings.parcel.label_max_g")}
                </Label>
                <Input
                  id="max_g"
                  type="number"
                  value={formData.max_g}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      max_g: parseFloat(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">
                  {t("app.paas.dashboard.settings.parcel.label_base_price")}
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price_per_km">
                  {t("app.paas.dashboard.settings.parcel.label_price_km")}
                </Label>
                <Input
                  id="price_per_km"
                  type="number"
                  value={formData.price_per_km}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price_per_km: parseFloat(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="special"
                checked={!!formData.special}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, special: checked ? 1 : 0 }))
                }
              />
              <Label htmlFor="special">
                {t("app.paas.dashboard.settings.parcel.label_special")}
              </Label>
            </div>
            {!!formData.special && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="special_price">
                    {t(
                      "app.paas.dashboard.settings.parcel.label_special_base_price",
                    )}
                  </Label>
                  <Input
                    id="special_price"
                    type="number"
                    value={formData.special_price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        special_price: parseFloat(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="special_price_per_km">
                    {t(
                      "app.paas.dashboard.settings.parcel.label_special_price_km",
                    )}
                  </Label>
                  <Input
                    id="special_price_per_km"
                    type="number"
                    value={formData.special_price_per_km}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        special_price_per_km: parseFloat(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            )}
            <ImageUpload
              label={t("app.paas.dashboard.settings.parcel.label_image")}
              value={formData.img}
              onChange={(url) => setFormData((prev) => ({ ...prev, img: url }))}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={processing}>
              {processing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : editing ? (
                t("common.update")
              ) : (
                t("common.create")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
