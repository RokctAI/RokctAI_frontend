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

import { RiLoader4Line, RiAddLine, RiDeleteBinLine } from "@remixicon/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  getReferrals,
  createReferral,
  deleteReferral,
} from "@/app/actions/promotions/admin/marketing";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import t from "@/app/lib/i18n";
export default function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    referrer: "",
    referred_user: "",
    referral_code: "",
  });

  useEffect(() => {
    loadReferrals();
  }, []);

  async function loadReferrals() {
    try {
      const data = await getReferrals();
      setReferrals(data);
    } catch (error) {
      toast.error("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      await createReferral(formData);
      toast.success("Referral created");
      setIsDialogOpen(false);
      setFormData({ referrer: "", referred_user: "", referral_code: "" });
      loadReferrals();
    } catch (error) {
      toast.error("Failed to create referral");
    }
  }

  async function handleDelete(name: string) {
    if (!confirm("Are you sure you want to delete this referral?")) return;
    try {
      await deleteReferral(name);
      toast.success("Referral deleted");
      loadReferrals();
    } catch (error) {
      toast.error("Failed to delete referral");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RiLoader4Line className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("loyalty.referrals")}</h2>
          <p className="text-muted-foreground">
            {t("loyalty.manage_user_referrals_and_codes")}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <RiAddLine className="mr-2 size-4" />
              {t("loyalty.add_referral")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("loyalty.add_new_referral")}</DialogTitle>
              <DialogDescription>
                {t("loyalty.manually_add_a_referral_record")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t("loyalty.referrer_user_email")}</Label>
                <Input
                  value={formData.referrer}
                  onChange={(e) =>
                    setFormData({ ...formData, referrer: e.target.value })
                  }
                  placeholder="referrer@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("loyalty.referred_user_user_email")}</Label>
                <Input
                  value={formData.referred_user}
                  onChange={(e) =>
                    setFormData({ ...formData, referred_user: e.target.value })
                  }
                  placeholder="newuser@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("loyalty.referral_code")}</Label>
                <Input
                  value={formData.referral_code}
                  onChange={(e) =>
                    setFormData({ ...formData, referral_code: e.target.value })
                  }
                  placeholder="CODE123"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>{t("loyalty.create_referral")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("loyalty.all_referrals")}</CardTitle>
          <CardDescription>
            {t("loyalty.list_of_all_referrals_in_the_system")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("loyalty.referrer")}</TableHead>
                <TableHead>{t("loyalty.referred_user")}</TableHead>
                <TableHead>{t("loyalty.code")}</TableHead>
                <TableHead className="text-right">{t("loyalty.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((referral) => (
                <TableRow key={referral.name}>
                  <TableCell>{referral.referrer}</TableCell>
                  <TableCell>{referral.referred_user}</TableCell>
                  <TableCell>{referral.referral_code}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(referral.name)}
                    >
                      <RiDeleteBinLine className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {referrals.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t("loyalty.no_referrals_found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
