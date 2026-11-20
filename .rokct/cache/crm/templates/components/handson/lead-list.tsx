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
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiMailLine,
  RiPhoneLine,
  RiSearchLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteLead } from "@/app/actions/handson/all/crm/leads";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

import t from "@/app/lib/i18n";
interface LeadListProps {
  leads: any[];
}

export function LeadList({ leads }: LeadListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (name: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    const result = await deleteLead(name);
    if (result.success) {
      toast.success("Lead deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete: " + result.error);
    }
  };

  const filteredLeads = leads.filter(
    (l) =>
      (l.lead_name &&
        l.lead_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.company_name &&
        l.company_name.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("crm.leads")}</h1>
          <p className="text-muted-foreground">
            {t("crm.manage_potential_customers_and_inquiries")}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-64">
            <RiSearchLine className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("crm.search_leads")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Link href="/handson/all/commercial/crm/leads/new">
            <Button>
              <RiAddLine className="mr-2 h-4 w-4" /> {t("crm.new_lead")}
            </Button>
          </Link>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("crm.lead_name")}</TableHead>
              <TableHead>{t("crm.company")}</TableHead>
              <TableHead>{t("crm.contact")}</TableHead>
              <TableHead>{t("crm.status")}</TableHead>
              <TableHead className="w-[100px]">{t("crm.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t("crm.no_leads_found")}
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.name}>
                  <TableCell className="font-medium">
                    {lead.lead_name}
                  </TableCell>
                  <TableCell>{lead.company_name || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs text-muted-foreground">
                      {lead.email_id && (
                        <span className="flex items-center gap-1">
                          <RiMailLine className="h-3 w-3" /> {lead.email_id}
                        </span>
                      )}
                      {lead.mobile_no && (
                        <span className="flex items-center gap-1">
                          <RiPhoneLine className="h-3 w-3" /> {lead.mobile_no}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        lead.status === "Converted" ? "default" : "secondary"
                      }
                    >
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/handson/all/commercial/crm/leads/${lead.name}`}
                      >
                        <Button variant="ghost" size="icon">
                          <RiEditLine className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(lead.name)}
                      >
                        <RiDeleteBinLine className="h-4 w-4" />
                      </Button>
                    </div>
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
