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

import { Loader2, Plus, Trash2, ChefHat } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getKitchens,
  createKitchen,
  deleteKitchen,
} from "@/app/actions/paas/operations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import t from "@/app/lib/i18n";

export default function KitchensPage() {
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({ name: "", active: 1 });

  useEffect(() => {
    fetchKitchens();
  }, []);

  async function fetchKitchens() {
    try {
      const data = await getKitchens();
      setKitchens(data);
    } catch (error) {
      console.error("Error fetching kitchens:", error);
      toast.error("Failed to load kitchens");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Kitchen name is required");
      return;
    }

    setProcessing(true);
    try {
      await createKitchen(formData);
      toast.success("Kitchen created successfully");
      setIsDialogOpen(false);
      setFormData({ name: "", active: 1 });
      fetchKitchens();
    } catch (error) {
      console.error("Error creating kitchen:", error);
      toast.error("Failed to create kitchen");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm("Are you sure you want to delete this kitchen?")) return;
    try {
      await deleteKitchen(name);
      toast.success("Kitchen deleted successfully");
      fetchKitchens();
    } catch (error) {
      console.error("Error deleting kitchen:", error);
      toast.error("Failed to delete kitchen");
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
            {t("app.paas.dashboard.restaurant.kitchens.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("app.paas.dashboard.restaurant.kitchens.desc")}
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 size-4" />{" "}
          {t("app.paas.dashboard.restaurant.kitchens.btn_add")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kitchens.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              {t("app.paas.dashboard.restaurant.kitchens.no_data")}
            </CardContent>
          </Card>
        ) : (
          kitchens.map((kitchen) => (
            <Card key={kitchen.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kitchen.name}
                </CardTitle>
                <ChefHat className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mt-4">
                  <div
                    className={`text-sm px-2 py-1 rounded-full ${kitchen.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {kitchen.active ? t("common.yes") : t("common.no")}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    onClick={() => handleDelete(kitchen.name)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("app.paas.dashboard.restaurant.kitchens.dialog_title")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                {t("app.paas.dashboard.restaurant.kitchens.label_name")}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t(
                  "app.paas.dashboard.restaurant.kitchens.ph_name",
                )}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={!!formData.active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, active: checked ? 1 : 0 }))
                }
              />
              <Label htmlFor="active">{t("common.active")}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={processing}>
              {processing ? (
                <Loader2 className="size-4 animate-spin" />
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
