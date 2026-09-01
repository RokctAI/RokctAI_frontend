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
import { toast } from "sonner";
import {
  Workflow,
  Plus,
  Trash2,
  Save,
  PlayCircle,
  Settings2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import {
  getGlobalWorkflows,
  saveGlobalWorkflow,
  deleteGlobalWorkflow,
  seedWorkflows,
} from "@/app/actions/handson/control/workflows/workflows";
import type { WorkflowRule } from "@/app/services/control/workflows";
import t from "@/app/lib/i18n";

const OPERATORS = [
  { label: t("app.workflows.operators.equals"), value: "equals" },
  { label: t("app.workflows.operators.not_equals"), value: "not_equals" },
  { label: t("app.workflows.operators.greater_than"), value: "greater_than" },
  { label: t("app.workflows.operators.less_than"), value: "less_than" },
  { label: t("app.workflows.operators.contains"), value: "contains" },
  { label: t("app.workflows.operators.is_empty"), value: "is_empty" },
  { label: t("app.workflows.operators.is_not_empty"), value: "is_not_empty" },
];

const DOCTYPES = [
  "Sales Invoice",
  "Quotation",
  "Sales Order",
  "Purchase Order",
];

const ACTIONS = [
  { label: t("app.workflows.actions.set_field"), value: "set_field" },
  { label: t("app.workflows.actions.block_save"), value: "block_save" },
];

export default function WorkflowsPage() {
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [editingRule, setEditingRule] = useState<WorkflowRule>({
    doc_type: "Sales Invoice",
    description: "",
    is_active: true,
    min_users: 0,
    conditions: [],
    actions: [],
  });

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    setLoading(true);
    try {
      const data = await getGlobalWorkflows();
      setRules(data || []);
    } catch (e) {
      toast.error(t("app.workflows.toast_load_fail"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSeed() {
    setLoading(true);
    await seedWorkflows();
    toast.success(t("app.workflows.toast_seed_success"));
    loadRules();
  }

  async function handleSave() {
    if (!editingRule.description) {
      toast.error(t("app.workflows.toast_desc_req"));
      return;
    }
    try {
      await saveGlobalWorkflow(editingRule);
      toast.success(t("app.workflows.toast_save_success"));
      setIsEditOpen(false);
      loadRules();
    } catch (e) {
      toast.error(t("app.workflows.toast_save_fail"));
    }
  }

  async function handleDelete(name?: string) {
    if (!name || !confirm("Delete this rule?")) return;
    await deleteGlobalWorkflow(name);
    toast.success(t("app.workflows.toast_delete_success"));
    loadRules();
  }

  const addCondition = () => {
    setEditingRule({
      ...editingRule,
      conditions: [
        ...editingRule.conditions,
        { field: "", operator: "equals", value: "" },
      ],
    });
  };

  const updateCondition = (index: number, key: string, val: string) => {
    const newConds = [...editingRule.conditions];
    (newConds[index] as any)[key] = val;
    setEditingRule({ ...editingRule, conditions: newConds });
  };

  const removeCondition = (index: number) => {
    setEditingRule({
      ...editingRule,
      conditions: editingRule.conditions.filter((_, i) => i !== index),
    });
  };

  const addAction = () => {
    setEditingRule({
      ...editingRule,
      actions: [
        ...editingRule.actions,
        { type: "set_field", field: "", value: "" },
      ],
    });
  };

  const updateAction = (index: number, key: string, val: string) => {
    const newActions = [...editingRule.actions];
    (newActions[index] as any)[key] = val;
    setEditingRule({ ...editingRule, actions: newActions });
  };

  const removeAction = (index: number) => {
    setEditingRule({
      ...editingRule,
      actions: editingRule.actions.filter((_, i) => i !== index),
    });
  };

  const openNew = () => {
    setEditingRule({
      doc_type: "Sales Invoice",
      description: "",
      is_active: true,
      conditions: [
        { field: "grand_total", operator: "greater_than", value: "1000" },
      ],
      actions: [
        { type: "set_field", field: "status", value: "Pending Approval" },
      ],
    });
    setIsEditOpen(true);
  };

  const openEdit = (rule: WorkflowRule) => {
    setEditingRule({ ...rule });
    setIsEditOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Workflow className="h-8 w-8" /> {t("app.workflows.title")}
          </h1>
          <p className="text-muted-foreground">{t("app.workflows.desc")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSeed}>
            <PlayCircle className="mr-2 h-4 w-4" />{" "}
            {t("app.workflows.btn_seed")}
          </Button>
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> {t("app.workflows.btn_new")}
          </Button>
        </div>
      </div>

      {/* Rule List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rules.map((rule) => (
          <Card
            key={rule.name}
            className="relative hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge variant="outline">{rule.doc_type}</Badge>
                <div className="flex gap-2">
                  {rule.min_users && rule.min_users > 1 && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      Teams ({rule.min_users}+)
                    </Badge>
                  )}
                  {rule.is_active ? (
                    <Badge className="bg-green-600">
                      {t("app.workflows.status_active")}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      {t("app.workflows.status_disabled")}
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="leading-tight mt-2">
                {rule.description}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-muted-foreground text-xs uppercase mb-1">
                    {t("app.workflows.condition_label")}
                  </p>
                  <ul className="space-y-1">
                    {rule.conditions.map((c, i) => (
                      <li key={i} className="bg-muted/50 p-1 rounded px-2">
                        <span className="font-mono">{c.field}</span>{" "}
                        {c.operator.replace("_", " ")} {c.value}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground text-xs uppercase mb-1">
                    {t("app.workflows.action_label")}
                  </p>
                  <ul className="space-y-1">
                    {rule.actions.map((a, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 p-1 px-2 rounded bg-blue-50 text-blue-800"
                      >
                        {a.type === "block_save" ? (
                          <span>
                            {t("app.workflows.block_save_msg", {
                              message: a.message,
                            })}
                          </span>
                        ) : (
                          <span>
                            {t("app.workflows.set_field_msg", {
                              field: a.field,
                              value: a.value,
                            })}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Hover actions if needed */}
              </div>
              <div className="flex justify-end mt-4 gap-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(rule)}
                >
                  {t("common.edit")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleDelete(rule.name)}
                >
                  {t("common.delete")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rules.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          <Workflow className="mx-auto h-12 w-12 opacity-20 mb-4" />
          <p>{t("app.workflows.no_rules")}</p>
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRule.name
                ? t("common.edit")
                : t("app.workflows.dialog_new")}
            </DialogTitle>
            <DialogDescription>
              {t("app.workflows.dialog_desc")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("app.workflows.label_doctype")}</Label>
                <Select
                  value={editingRule.doc_type}
                  onValueChange={(val) =>
                    setEditingRule({ ...editingRule, doc_type: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCTYPES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("app.workflows.label_desc")}</Label>
              <Input
                value={editingRule.description}
                onChange={(e) =>
                  setEditingRule({
                    ...editingRule,
                    description: e.target.value,
                  })
                }
                placeholder={t("app.workflows.ph_desc")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("app.workflows.label_min_users")}</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                className="w-[100px]"
                value={editingRule.min_users || 0}
                onChange={(e) =>
                  setEditingRule({
                    ...editingRule,
                    min_users: parseInt(e.target.value),
                  })
                }
              />
              <span className="text-sm text-muted-foreground">
                {t("app.workflows.min_users_desc")}
              </span>
            </div>
          </div>

          {/* Conditions Section */}
          <div className="space-y-3 border p-4 rounded-lg bg-muted/20">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-sm">
                {t("app.workflows.conditions_title")}
              </h4>
              <Button size="sm" variant="outline" onClick={addCondition}>
                <Plus className="h-3 w-3 mr-1" /> {t("app.workflows.btn_add")}
              </Button>
            </div>
            {editingRule.conditions.map((c, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  className="w-[150px]"
                  placeholder={t("app.workflows.ph_field")}
                  value={c.field}
                  onChange={(e) => updateCondition(i, "field", e.target.value)}
                />
                <Select
                  value={c.operator}
                  onValueChange={(val) => updateCondition(i, "operator", val)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {c.operator !== "is_empty" && c.operator !== "is_not_empty" && (
                  <Input
                    className="flex-1"
                    placeholder={t("app.workflows.ph_value")}
                    value={c.value}
                    onChange={(e) =>
                      updateCondition(i, "value", e.target.value)
                    }
                  />
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => removeCondition(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Actions Section */}
          <div className="space-y-3 border p-4 rounded-lg bg-blue-50/50">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-sm">
                {t("app.workflows.actions_title")}
              </h4>
              <Button size="sm" variant="outline" onClick={addAction}>
                <Plus className="h-3 w-3 mr-1" /> {t("app.workflows.btn_add")}
              </Button>
            </div>
            {editingRule.actions.map((a, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 border-b pb-2 last:border-0"
              >
                <div className="flex gap-2 items-center">
                  <Select
                    value={a.type}
                    onValueChange={(val) => updateAction(i, "type", val)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIONS.map((ac) => (
                        <SelectItem key={ac.value} value={ac.value}>
                          {ac.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-auto text-muted-foreground"
                    onClick={() => removeAction(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {a.type === "set_field" && (
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("app.workflows.ph_set_field")}
                      value={a.field}
                      onChange={(e) => updateAction(i, "field", e.target.value)}
                    />
                    <Input
                      placeholder={t("app.workflows.ph_set_value")}
                      value={a.value}
                      onChange={(e) => updateAction(i, "value", e.target.value)}
                    />
                  </div>
                )}

                {a.type === "block_save" && (
                  <Input
                    placeholder={t("app.workflows.ph_error_msg")}
                    value={a.message}
                    onChange={(e) => updateAction(i, "message", e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={editingRule.is_active}
              onCheckedChange={(c) =>
                setEditingRule({ ...editingRule, is_active: c })
              }
            />
            <Label>{t("app.workflows.label_active")}</Label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> {t("app.workflows.btn_save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
