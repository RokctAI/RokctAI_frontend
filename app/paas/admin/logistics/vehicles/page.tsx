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

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import t from "@/app/lib/i18n";

import {
  getVehicleTypes,
  createVehicleType,
  deleteVehicleType,
} from "@/app/actions/paas/admin/logistics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminVehicleTypesPage() {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newType, setNewType] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTypes();
  }, []);

  async function fetchTypes() {
    try {
      const data = await getVehicleTypes();
      setTypes(data);
    } catch (error) {
      console.error("Error fetching vehicle types:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async () => {
    try {
      await createVehicleType({ name: newType });
      toast.success(t("paas.admin.logistics.vehicles.toast_create_success"));
      setNewType("");
      setIsDialogOpen(false);
      fetchTypes();
    } catch (error) {
      toast.error(t("paas.admin.logistics.vehicles.toast_create_fail"));
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(t("paas.admin.logistics.vehicles.confirm_delete"))) return;
    try {
      await deleteVehicleType(name);
      toast.success(t("paas.admin.logistics.vehicles.toast_delete_success"));
      fetchTypes();
    } catch (error) {
      toast.error(t("paas.admin.logistics.vehicles.toast_delete_fail"));
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {t("paas.admin.logistics.vehicles.title")}
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              {t("paas.admin.logistics.vehicles.btn_add")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("paas.admin.logistics.vehicles.dialog_title")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder={t("paas.admin.logistics.vehicles.ph_name")}
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              />
              <Button onClick={handleCreate} className="w-full">
                {t("paas.admin.logistics.vehicles.btn_create")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {t("paas.admin.logistics.vehicles.col_name")}
              </TableHead>
              <TableHead className="text-right">
                {t("paas.admin.logistics.vehicles.col_actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {types.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center h-24">
                  {t("paas.admin.logistics.vehicles.no_vehicles")}
                </TableCell>
              </TableRow>
            ) : (
              types.map((type) => (
                <TableRow key={type.name}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(type.name)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
