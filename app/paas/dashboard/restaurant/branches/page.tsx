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

import { Loader2, Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} from "@/app/actions/paas/branches";
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

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  async function fetchBranches() {
    try {
      const data = await getBranches();
      setBranches(data);
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDialog = (branch?: any) => {
    if (branch) {
      setEditing(branch);
      setFormData({
        name: branch.branch_name || "",
        address: branch.address || "",
        latitude: branch.latitude || "",
        longitude: branch.longitude || "",
      });
    } else {
      setEditing(null);
      setFormData({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address) {
      toast.error("Branch name and address are required");
      return;
    }

    setProcessing(true);
    try {
      if (editing) {
        await updateBranch(editing.name, formData);
        toast.success("Branch updated successfully");
      } else {
        await createBranch(formData);
        toast.success("Branch created successfully");
      }
      setIsDialogOpen(false);
      fetchBranches();
    } catch (error) {
      console.error("Error saving branch:", error);
      toast.error("Failed to save branch");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;
    try {
      await deleteBranch(id);
      toast.success("Branch deleted successfully");
      fetchBranches();
    } catch (error) {
      console.error("Error deleting branch:", error);
      toast.error("Failed to delete branch");
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
            {t("app.paas.dashboard.restaurant.branches.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("app.paas.dashboard.restaurant.branches.desc")}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 size-4" />{" "}
          {t("app.paas.dashboard.restaurant.branches.btn_add")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("app.paas.dashboard.restaurant.branches.card_title")}
          </CardTitle>
          <CardDescription>
            {t("app.paas.dashboard.restaurant.branches.card_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("app.paas.dashboard.restaurant.branches.col_name")}
                </TableHead>
                <TableHead>
                  {t("app.paas.dashboard.restaurant.branches.col_address")}
                </TableHead>
                <TableHead>
                  {t("app.paas.dashboard.restaurant.branches.col_coords")}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No branches found. Add your first branch to get started.
                  </TableCell>
                </TableRow>
              ) : (
                branches.map((branch) => (
                  <TableRow key={branch.name}>
                    <TableCell className="font-medium">
                      {branch.branch_name}
                    </TableCell>
                    <TableCell>{branch.address}</TableCell>
                    <TableCell>
                      {branch.latitude && branch.longitude ? (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="size-3" />
                          {branch.latitude}, {branch.longitude}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {t("app.paas.dashboard.restaurant.branches.not_set")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(branch)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(branch.name)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing
                ? t("app.paas.dashboard.restaurant.branches.dialog_edit")
                : t("app.paas.dashboard.restaurant.branches.dialog_add")}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? t("app.paas.dashboard.restaurant.branches.dialog_edit_desc")
                : t("app.paas.dashboard.restaurant.branches.dialog_add_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                {t("app.paas.dashboard.restaurant.branches.label_name")}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t(
                  "app.paas.dashboard.restaurant.branches.ph_name",
                )}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">
                {t("app.paas.dashboard.restaurant.branches.label_address")}
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder={t(
                  "app.paas.dashboard.restaurant.branches.ph_address",
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">
                  {t("app.paas.dashboard.restaurant.branches.label_latitude")}
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      latitude: e.target.value,
                    }))
                  }
                  placeholder="0.0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longitude">
                  {t("app.paas.dashboard.restaurant.branches.label_longitude")}
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      longitude: e.target.value,
                    }))
                  }
                  placeholder="0.0"
                />
              </div>
            </div>
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
