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

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RiAddLine, RiArrowLeftLine, RiLoader4Line } from "@remixicon/react";
import { toast } from "sonner";
import {
  getSubscriptionPlans,
  createSubscriptionPlan,
  getSubscriptions,
  createSubscription,
} from "@/app/actions/handson/all/crm/subscriptions";
import { getCustomers } from "@/app/actions/handson/all/accounting/selling/sales_order";

import t from "@/app/lib/i18n";
// --- SUBSCRIPTION PLAN ---

export function SubscriptionPlanList() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getSubscriptionPlans().then((d) => {
      setList(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>{t("erp.loading")}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("erp.subscription_plans")}</h2>
        <Button
          onClick={() =>
            router.push("/handson/all/commercial/subscriptions/plan/new")
          }
        >
          <RiAddLine className="h-4 w-4 mr-2" /> {t("erp.new_plan")}
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("erp.name")}</TableHead>
                <TableHead>{t("erp.currency")}</TableHead>
                <TableHead>{t("erp.cost")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((l) => (
                <TableRow key={l.name}>
                  <TableCell className="font-medium">{l.plan_name}</TableCell>
                  <TableCell>{l.currency}</TableCell>
                  <TableCell>{l.cost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export function SubscriptionPlanForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plan_name: "",
    currency: "USD",
    cost: 0,
    billing_interval: "Month" as "Month" | "Year",
  });

  const handleSubmit = async () => {
    setLoading(true);
    const res = await createSubscriptionPlan(formData);
    if (res.success) {
      toast.success("Plan Created");
      router.push("/handson/all/commercial/subscriptions/plan");
    } else toast.error("Failed: " + res.error);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <Button variant="ghost" size="icon" onClick={() => router.back()}>
        <RiArrowLeftLine className="h-4 w-4" />
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{t("erp.new_subscription_plan")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("erp.plan_name")}</Label>
            <Input
              value={formData.plan_name}
              onChange={(e) =>
                setFormData({ ...formData, plan_name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("erp.currency")}</Label>
            <Input
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("erp.cost")}</Label>
            <Input
              type="number"
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: parseFloat(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("erp.interval")}</Label>
            <Select
              value={formData.billing_interval}
              onValueChange={(v) =>
                setFormData({ ...formData, billing_interval: v as any })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Month">{t("erp.month")}</SelectItem>
                <SelectItem value="Year">{t("erp.year")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {t("erp.submit")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// --- SUBSCRIPTION ---

export function SubscriptionList() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getSubscriptions().then((d) => {
      setList(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>{t("erp.loading")}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("erp.subscriptions")}</h2>
        <Button
          onClick={() =>
            router.push(
              "/handson/all/commercial/subscriptions/subscription/new",
            )
          }
        >
          <RiAddLine className="h-4 w-4 mr-2" /> {t("erp.new_subscription")}
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("erp.name")}</TableHead>
                <TableHead>{t("erp.party")}</TableHead>
                <TableHead>{t("erp.status")}</TableHead>
                <TableHead>{t("erp.start_date")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((l) => (
                <TableRow key={l.name}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell>{l.party}</TableCell>
                  <TableCell>{l.status}</TableCell>
                  <TableCell>{l.start_date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export function SubscriptionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    party_type: "Customer",
    party: "",
    plans: [{ plan: "", qty: 1 }],
  });

  useEffect(() => {
    getCustomers().then((c) => setCustomers(c || []));
    getSubscriptionPlans().then(setPlans);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await createSubscription(formData);
    if (res.success) {
      toast.success("Subscription Created");
      router.push("/handson/all/commercial/subscriptions/subscription");
    } else toast.error("Failed: " + res.error);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <Button variant="ghost" size="icon" onClick={() => router.back()}>
        <RiArrowLeftLine className="h-4 w-4" />
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{t("erp.new_subscription")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("erp.customer")}</Label>
            <Select
              value={formData.party}
              onValueChange={(v) => setFormData({ ...formData, party: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("erp.select_customer")} />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.customer_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("erp.plan")}</Label>
            <Select
              value={formData.plans[0].plan}
              onValueChange={(v) =>
                setFormData({
                  ...formData,
                  plans: [{ ...formData.plans[0], plan: v }],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("erp.select_plan")} />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.name} value={p.name}>
                    {p.plan_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {t("erp.submit")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
