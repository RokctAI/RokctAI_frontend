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

import { useEffect, useState } from "react";
import { RiAddLine, RiDownloadLine, RiFileTextLine } from "@remixicon/react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPolicies,
  createPolicy,
} from "@/app/actions/handson/all/crm/lifecycle";

import t from "@/app/lib/i18n";
export default function PolicyPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await getPolicies();
    setPolicies(data || []);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      policy_type: formData.get("policy_type"),
      date: formData.get("date"),
      details: formData.get("details"),
    };

    try {
      await createPolicy(data);
      toast.success("Policy created");
      setIsOpen(false);
      loadData();
    } catch (error) {
      toast.error("Failed to create policy");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("erp.company_policies")}</h1>
          <p className="text-muted-foreground">
            {t("erp.manage_internal_hr_and_security_policies")}
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <RiAddLine className="mr-2 h-4 w-4" /> {t("erp.new_policy")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("erp.new_policy")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("erp.title")}</Label>
                <Input
                  name="title"
                  required
                  placeholder="e.g. Remote Work Policy"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("erp.type")}</Label>
                <Select name="policy_type" defaultValue="General">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR">{t("erp.hr")}</SelectItem>
                    <SelectItem value="Security">{t("erp.security")}</SelectItem>
                    <SelectItem value="Leave">{t("erp.leave")}</SelectItem>
                    <SelectItem value="Expense">{t("erp.expense")}</SelectItem>
                    <SelectItem value="General">{t("erp.general")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("erp.effective_date")}</Label>
                <Input
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("erp.details")}</Label>
                <Textarea name="details" placeholder={t("erp.policy_content")} />
              </div>
              <Button type="submit" className="w-full">
                {t("erp.create_policy")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("erp.all_policies")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("erp.title")}</TableHead>
                <TableHead>{t("erp.type")}</TableHead>
                <TableHead>{t("erp.date")}</TableHead>
                <TableHead>{t("erp.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.name}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <RiFileTextLine className="mr-2 h-4 w-4 text-muted-foreground" />
                      {policy.title}
                    </div>
                  </TableCell>
                  <TableCell>{policy.policy_type}</TableCell>
                  <TableCell>
                    {format(new Date(policy.date || new Date()), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      {t("erp.view")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {policies.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground h-24"
                  >
                    {t("erp.no_policies_found")}
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
