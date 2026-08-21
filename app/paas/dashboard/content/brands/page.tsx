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

import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/app/actions/paas/brands";
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
import t from "@/app/lib/i18n";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    image: "",
    active: 1,
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  async function fetchBrands() {
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDialog = (brand?: any) => {
    if (brand) {
      setEditing(brand);
      setFormData({
        title: brand.title || "",
        slug: brand.slug || "",
        image: brand.image || "",
        active: brand.active || 1,
      });
    } else {
      setEditing(null);
      setFormData({
        title: "",
        slug: "",
        image: "",
        active: 1,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast.error("Brand title is required");
      return;
    }

    setProcessing(true);
    try {
      if (editing) {
        await updateBrand(editing.uuid, formData);
        toast.success("Brand updated successfully");
      } else {
        await createBrand(formData);
        toast.success("Brand created successfully");
      }
      setIsDialogOpen(false);
      fetchBrands();
    } catch (error) {
      console.error("Error saving brand:", error);
      toast.error("Failed to save brand");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (uuid: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    try {
      await deleteBrand(uuid);
      toast.success("Brand deleted successfully");
      fetchBrands();
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast.error("Failed to delete brand");
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
            {t("app.paas.dashboard.content.brands.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("app.paas.dashboard.content.brands.desc")}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 size-4" />
          {t("app.paas.dashboard.content.brands.btn_add")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("app.paas.dashboard.content.brands.list_title")}
          </CardTitle>
          <CardDescription>
            {t("app.paas.dashboard.content.brands.list_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("app.paas.dashboard.content.brands.col_name")}
                </TableHead>
                <TableHead>
                  {t("app.paas.dashboard.content.brands.col_slug")}
                </TableHead>
                <TableHead>
                  {t("app.paas.dashboard.content.brands.col_status")}
                </TableHead>
                <TableHead className="text-right">
                  {t("common.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    {t("app.paas.dashboard.content.brands.no_brands")}
                  </TableCell>
                </TableRow>
              ) : (
                brands.map((brand) => (
                  <TableRow key={brand.uuid}>
                    <TableCell className="font-medium">{brand.title}</TableCell>
                    <TableCell>{brand.slug || "-"}</TableCell>
                    <TableCell>
                      {brand.active ? t("common.active") : t("common.inactive")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(brand)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(brand.uuid)}
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
                ? t("app.paas.dashboard.content.brands.dialog_edit")
                : t("app.paas.dashboard.content.brands.dialog_add")}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? t("app.paas.dashboard.content.brands.dialog_edit_desc")
                : t("app.paas.dashboard.content.brands.dialog_add_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                {t("app.paas.dashboard.content.brands.label_name")}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder={t("app.paas.dashboard.content.brands.ph_title")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">
                {t("app.paas.dashboard.content.brands.label_slug")}
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder={t("app.paas.dashboard.content.brands.ph_slug")}
              />
            </div>
            <ImageUpload
              label={t("app.paas.dashboard.content.brands.label_logo")}
              value={formData.image}
              onChange={(url) =>
                setFormData((prev) => ({ ...prev, image: url }))
              }
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={processing}>
              {processing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : editing ? (
                t("app.paas.dashboard.content.brands.btn_update")
              ) : (
                t("app.paas.dashboard.content.brands.btn_add")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
