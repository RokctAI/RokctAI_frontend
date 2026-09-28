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

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  activateCustomerSubscription,
  cancelCustomerSubscriptionAdmin,
  type CustomerSubscriber,
  type CustomerSubscriptionStatus,
  getCustomerSubscribers,
  type CustomerSubscriptionBenefit,
  type CustomerSubscriptionBenefitType,
  type CustomerSubscriptionPlan,
  deleteCustomerSubscriptionPlan,
  getCustomerSubscriptionPlans,
  saveCustomerSubscriptionPlan,
} from "@/app/actions/loyalty/admin/customer-subscriptions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

const BENEFIT_TYPES: CustomerSubscriptionBenefitType[] = [
  "Free Delivery",
  "Delivery Discount",
  "Service Fee Waiver",
  "Other",
];
const PERIODS: CustomerSubscriptionPlan["period"][] = [
  "Monthly",
  "Quarterly",
  "Yearly",
];

const EMPTY_PLAN: CustomerSubscriptionPlan = {
  plan_name: "",
  description: "",
  price: 0,
  currency: "",
  period: "Monthly",
  active: 1,
  benefits: [{ benefit_type: "Free Delivery", value: null, description: "" }],
};

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm";

function benefitLabel(b: CustomerSubscriptionBenefit): string {
  if (b.benefit_type === "Delivery Discount")
    return `${b.value ?? 0}% off delivery`;
  if (b.description) return `${b.benefit_type}: ${b.description}`;
  return b.benefit_type;
}

const STATUSES: CustomerSubscriptionStatus[] = [
  "Pending",
  "Active",
  "Past Due",
  "Cancelled",
  "Expired",
];

function statusVariant(
  status: CustomerSubscriptionStatus,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "Active") return "default";
  if (status === "Past Due") return "destructive";
  if (status === "Pending") return "outline";
  return "secondary";
}

function SubscribersTab() {
  const [rows, setRows] = useState<CustomerSubscriber[]>([]);
  const [status, setStatus] = useState<CustomerSubscriptionStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setRows(await getCustomerSubscribers(status));
    setLoading(false);
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(name: string, action: (n: string) => Promise<unknown>) {
    setBusy(name);
    setError(null);
    try {
      await action(name);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update subscription");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="status_filter">Status</Label>
        <select
          id="status_filter"
          className={`${selectClass} max-w-48`}
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as CustomerSubscriptionStatus | "")
          }
        >
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Pays by</TableHead>
              <TableHead>Renews</TableHead>
              <TableHead className="w-40" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="size-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No subscribers yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.customer}</TableCell>
                  <TableCell>{row.plan}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(row.status)}>
                      {row.status}
                    </Badge>
                    {row.last_payment_error && row.status !== "Active" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {row.last_payment_error}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.start_date
                      ? `${row.start_date} to ${row.end_date ?? ""}`
                      : "Not started"}
                  </TableCell>
                  <TableCell>{row.payment_method ?? "Wallet"}</TableCell>
                  <TableCell>{row.auto_renew ? "Yes" : "No"}</TableCell>
                  <TableCell className="flex gap-1">
                    {row.status === "Pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy === row.name}
                        onClick={() =>
                          run(row.name, activateCustomerSubscription)
                        }
                      >
                        Activate
                      </Button>
                    )}
                    {["Pending", "Active", "Past Due"].includes(row.status) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy === row.name}
                        onClick={() => {
                          if (
                            confirm(
                              `Cancel ${row.customer}'s subscription now? Benefits stop immediately.`,
                            )
                          )
                            run(row.name, cancelCustomerSubscriptionAdmin);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
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

export default function CustomerSubscriptionsPage() {
  const [tab, setTab] = useState<"plans" | "subscribers">("plans");
  const [plans, setPlans] = useState<CustomerSubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CustomerSubscriptionPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setPlans(await getCustomerSubscriptionPlans());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (patch: Partial<CustomerSubscriptionPlan>) =>
    setEditing((p) => (p ? { ...p, ...patch } : p));

  const updateBenefit = (
    i: number,
    patch: Partial<CustomerSubscriptionBenefit>,
  ) =>
    setEditing((p) =>
      p
        ? {
            ...p,
            benefits: p.benefits.map((b, j) =>
              j === i ? { ...b, ...patch } : b,
            ),
          }
        : p,
    );

  async function onSave() {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      await saveCustomerSubscriptionPlan(editing);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save plan");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(plan: CustomerSubscriptionPlan) {
    if (!plan.name || !confirm(`Delete plan "${plan.plan_name}"?`)) return;
    try {
      await deleteCustomerSubscriptionPlan(plan.name);
      await load();
    } catch (e) {
      console.error("Failed to delete plan:", e);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customer Subscriptions</h1>
        {tab === "plans" && (
        <Button
          onClick={() =>
            setEditing({ ...EMPTY_PLAN, benefits: [...EMPTY_PLAN.benefits] })
          }
        >
          <Plus className="size-4 mr-2" /> New plan
        </Button>
        )}
      </div>

      <div className="flex gap-2" role="tablist">
        <Button
          role="tab"
          aria-selected={tab === "plans"}
          variant={tab === "plans" ? "default" : "outline"}
          onClick={() => setTab("plans")}
        >
          Plans
        </Button>
        <Button
          role="tab"
          aria-selected={tab === "subscribers"}
          variant={tab === "subscribers" ? "default" : "outline"}
          onClick={() => setTab("subscribers")}
        >
          Subscribers
        </Button>
      </div>

      {tab === "subscribers" ? (
        <SubscribersTab />
      ) : (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Benefits</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="size-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : plans.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No customer subscription plans yet.
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.name}>
                  <TableCell className="font-medium">
                    {plan.plan_name}
                  </TableCell>
                  <TableCell>
                    {plan.price} {plan.currency}
                  </TableCell>
                  <TableCell>{plan.period}</TableCell>
                  <TableCell className="space-x-1">
                    {plan.benefits.map((b, i) => (
                      <Badge key={i} variant="outline">
                        {benefitLabel(b)}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.active ? "default" : "secondary"}>
                      {plan.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Edit"
                      onClick={() =>
                        setEditing({ ...plan, benefits: [...plan.benefits] })
                      }
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Delete"
                      onClick={() => onDelete(plan)}
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
      )}

      <Dialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.name ? "Edit plan" : "New customer subscription plan"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="plan_name">Name</Label>
                  <Input
                    id="plan_name"
                    value={editing.plan_name}
                    disabled={!!editing.name}
                    onChange={(e) => update({ plan_name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="period">Billing period</Label>
                  <select
                    id="period"
                    className={selectClass}
                    value={editing.period}
                    onChange={(e) =>
                      update({
                        period: e.target
                          .value as CustomerSubscriptionPlan["period"],
                      })
                    }
                  >
                    {PERIODS.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={editing.price}
                    onChange={(e) => update({ price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    placeholder="e.g. ZAR"
                    value={editing.currency ?? ""}
                    onChange={(e) => update({ currency: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editing.description ?? ""}
                  onChange={(e) => update({ description: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!editing.active}
                  onChange={(e) => update({ active: e.target.checked ? 1 : 0 })}
                />
                Active (customers can subscribe)
              </label>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Benefits</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      update({
                        benefits: [
                          ...editing.benefits,
                          {
                            benefit_type: "Other",
                            value: null,
                            description: "",
                          },
                        ],
                      })
                    }
                  >
                    <Plus className="size-4 mr-1" /> Add benefit
                  </Button>
                </div>
                {editing.benefits.map((b, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_7rem_1.5fr_auto] gap-2"
                  >
                    <select
                      aria-label="Benefit type"
                      className={selectClass}
                      value={b.benefit_type}
                      onChange={(e) =>
                        updateBenefit(i, {
                          benefit_type: e.target
                            .value as CustomerSubscriptionBenefitType,
                        })
                      }
                    >
                      {BENEFIT_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    <Input
                      aria-label="Value"
                      type="number"
                      placeholder={
                        b.benefit_type === "Delivery Discount" ? "%" : "Value"
                      }
                      value={b.value ?? ""}
                      onChange={(e) =>
                        updateBenefit(i, {
                          value:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                    />
                    <Input
                      aria-label="Description"
                      placeholder="Shown to customers"
                      value={b.description ?? ""}
                      onChange={(e) =>
                        updateBenefit(i, { description: e.target.value })
                      }
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Remove benefit"
                      onClick={() =>
                        update({
                          benefits: editing.benefits.filter((_, j) => j !== i),
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving || !editing?.plan_name}>
              {saving && <Loader2 className="size-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
