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
import { RiAddLine } from "@remixicon/react";
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
import { useRouter } from "next/navigation";
import { createEmailCampaign } from "@/app/actions/handson/all/crm/campaigns";
import { createContract } from "@/app/actions/handson/all/crm/contracts";
import {
  createSalesPartner,
  createProductBundle,
  createShippingRule,
} from "@/app/actions/handson/all/accounting/selling/extras";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import t from "@/app/lib/i18n";
// --- GENERIC LIST ---
export function SimpleList({
  title,
  items,
  newItemUrl,
  headers,
  renderRow,
}: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        {newItemUrl && (
          <Link href={newItemUrl}>
            <Button>
              <RiAddLine className="mr-2 h-4 w-4" /> {t("erp.new")}
            </Button>
          </Link>
        )}
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((h: any) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{items.map((item: any) => renderRow(item))}</TableBody>
        </Table>
      </div>
    </div>
  );
}

// --- EMAIL CAMPAIGN ---
export function EmailCampaignForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [recipient, setRecipient] = useState("");
  const handleSubmit = async () => {
    const res = await createEmailCampaign({
      campaign_name: name,
      email_template: "Default",
      start_date: new Date().toISOString().split("T")[0],
      email_campaign_for: "Lead",
      recipient,
    });
    if (res.success) {
      toast.success("Created");
      router.push("/handson/all/commercial/crm/email-campaign");
    } else toast.error(res.error);
  };
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div>
            <Label>{t("erp.campaign_name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>{t("erp.recipient_lead_email")}</Label>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit}>{t("erp.create_campaign")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// --- CONTRACT ---
export function ContractForm() {
  const router = useRouter();
  const [party, setParty] = useState("");
  const handleSubmit = async () => {
    const res = await createContract({
      party_type: "Customer",
      party_name: party,
      contract_terms: "Standard Terms",
    });
    if (res.success) {
      toast.success("Created");
      router.push("/handson/all/commercial/crm/contract");
    } else toast.error(res.error);
  };
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div>
            <Label>{t("erp.customer")}</Label>
            <Input value={party} onChange={(e) => setParty(e.target.value)} />
          </div>
          <Button onClick={handleSubmit}>{t("erp.create_contract")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// --- SALES PARTNER ---
export function SalesPartnerForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [rate, setRate] = useState(0);
  const handleSubmit = async () => {
    const res = await createSalesPartner({
      partner_name: name,
      commission_rate: rate,
    });
    if (res.success) {
      toast.success("Created");
      router.push("/handson/all/commercial/selling/sales-partner");
    } else toast.error(res.error);
  };
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div>
            <Label>{t("erp.partner_name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>{t("erp.commission_rate")}</Label>
            <Input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </div>
          <Button onClick={handleSubmit}>{t("erp.create_partner")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// --- PRODUCT BUNDLE ---
export function ProductBundleForm() {
  const router = useRouter();
  const [parent, setParent] = useState("");
  const [child, setChild] = useState("");
  const handleSubmit = async () => {
    const res = await createProductBundle({
      new_item_code: parent,
      items: [{ item_code: child, qty: 1 }],
    });
    if (res.success) {
      toast.success("Created");
      router.push("/handson/all/commercial/selling/product-bundle");
    } else toast.error(res.error);
  };
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div>
            <Label>{t("erp.parent_item_bundle")}</Label>
            <Input value={parent} onChange={(e) => setParent(e.target.value)} />
          </div>
          <div>
            <Label>{t("erp.child_item")}</Label>
            <Input value={child} onChange={(e) => setChild(e.target.value)} />
          </div>
          <Button onClick={handleSubmit}>{t("erp.create_bundle")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// --- SHIPPING RULE ---
export function ShippingRuleForm() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState(0);
  const handleSubmit = async () => {
    const res = await createShippingRule({
      label,
      calculate_based_on: "Fixed",
      shipping_amount: amount,
    });
    if (res.success) {
      toast.success("Created");
      router.push("/handson/all/commercial/selling/shipping-rule");
    } else toast.error(res.error);
  };
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div>
            <Label>{t("erp.label")}</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div>
            <Label>{t("erp.amount")}</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <Button onClick={handleSubmit}>{t("erp.create_rule")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
