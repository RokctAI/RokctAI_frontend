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

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiArrowLeftLine, RiSaveLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createLead,
  updateLead,
  LeadData,
} from "@/app/actions/handson/all/crm/leads";
import { toast } from "sonner";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import t from "@/app/lib/i18n";
interface LeadFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function LeadForm({ initialData, isEdit = false }: LeadFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [leadName, setLeadName] = useState(initialData?.lead_name || "");
  const [companyName, setCompanyName] = useState(
    initialData?.company_name || "",
  );
  const [email, setEmail] = useState(initialData?.email_id || "");
  const [mobile, setMobile] = useState(initialData?.mobile_no || "");
  const [status, setStatus] = useState(initialData?.status || "Lead");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leadName) {
      toast.error("Lead Name is required");
      return;
    }

    setLoading(true);

    const payload: LeadData = {
      lead_name: leadName,
      company_name: companyName,
      email_id: email,
      mobile_no: mobile,
      status: status,
    };

    let result;
    if (isEdit) {
      result = await updateLead(initialData.name, payload);
    } else {
      result = await createLead(payload);
    }

    setLoading(false);

    if (result.success) {
      toast.success(isEdit ? "Lead updated" : "Lead created");
      router.push("/handson/all/commercial/crm/leads");
      router.refresh();
    } else {
      toast.error("Failed: " + result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/handson/all/commercial/crm/leads">
            <Button variant="outline" size="icon" type="button">
              <RiArrowLeftLine className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            {isEdit ? `Edit Lead: ${initialData.lead_name}` : "New Lead"}
          </h1>
        </div>
        <Button type="submit" disabled={loading}>
          <RiSaveLine className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("crm.lead_details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leadName">{t("crm.lead_name_person")}</Label>
            <Input
              id="leadName"
              placeholder="e.g. John Doe"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">{t("crm.company_name_optional")}</Label>
            <Input
              id="companyName"
              placeholder="e.g. Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("crm.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">{t("crm.mobile")}</Label>
              <Input
                id="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("crm.status")}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder={t("crm.select_status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lead">{t("crm.lead")}</SelectItem>
                <SelectItem value="Open">{t("crm.open")}</SelectItem>
                <SelectItem value="Replied">{t("crm.replied")}</SelectItem>
                <SelectItem value="Opportunity">{t("crm.opportunity")}</SelectItem>
                <SelectItem value="Quotation">{t("crm.quotation")}</SelectItem>
                <SelectItem value="Lost">{t("crm.lost")}</SelectItem>
                <SelectItem value="Interested">{t("crm.interested")}</SelectItem>
                <SelectItem value="Converted">{t("crm.converted")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
