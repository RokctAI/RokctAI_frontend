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

import { RiLoader4Line, RiSaveLine } from "@remixicon/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  getPermissionSettings,
  updatePermissionSettings,
} from "@/app/actions/base/admin/settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import t from "@/app/lib/i18n";
export default function PermissionSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await getPermissionSettings();
      setSettings(data);
    } catch (error) {
      toast.error("Failed to load permission settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updatePermissionSettings(settings);
      toast.success("Permission settings updated successfully");
    } catch (error) {
      toast.error("Failed to update permission settings");
    } finally {
      setSaving(false);
    }
  }

  const handleToggle = (key: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RiLoader4Line className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("users.permission_settings")}
          </h2>
          <p className="text-muted-foreground">
            {t("users.manage_global_system_permissions_and_feature_tog")}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <RiLoader4Line className="mr-2 size-4 animate-spin" />}
          {!saving && <RiSaveLine className="mr-2 size-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("users.order_management")}</CardTitle>
            <CardDescription>{t("users.configure_order_processing_rules")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="auto_approve_orders">
                {t("users.auto_approve_all_orders")}
              </Label>
              <Switch
                id="auto_approve_orders"
                checked={settings.auto_approve_orders}
                onCheckedChange={() => handleToggle("auto_approve_orders")}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="auto_approve_parcel_orders">
                {t("users.auto_approve_parcel_orders")}
              </Label>
              <Switch
                id="auto_approve_parcel_orders"
                checked={settings.auto_approve_parcel_orders}
                onCheckedChange={() =>
                  handleToggle("auto_approve_parcel_orders")
                }
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="require_phone_for_order">
                {t("users.require_phone_number_for_order")}
              </Label>
              <Switch
                id="require_phone_for_order"
                checked={settings.require_phone_for_order}
                onCheckedChange={() => handleToggle("require_phone_for_order")}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enable_group_orders">{t("users.enable_group_orders")}</Label>
              <Switch
                id="enable_group_orders"
                checked={settings.enable_group_orders}
                onCheckedChange={() => handleToggle("enable_group_orders")}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enable_auto_print_order">
                {t("users.enable_auto_print_order")}
              </Label>
              <Switch
                id="enable_auto_print_order"
                checked={settings.enable_auto_print_order}
                onCheckedChange={() => handleToggle("enable_auto_print_order")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("users.refund_system")}</CardTitle>
            <CardDescription>{t("users.manage_refund_capabilities")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enable_refund_system">{t("users.enable_refund_system")}</Label>
              <Switch
                id="enable_refund_system"
                checked={settings.enable_refund_system}
                onCheckedChange={() => handleToggle("enable_refund_system")}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enable_refund_deletion">
                {t("users.enable_refund_deletion")}
              </Label>
              <Switch
                id="enable_refund_deletion"
                checked={settings.enable_refund_deletion}
                onCheckedChange={() => handleToggle("enable_refund_deletion")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("users.delivery_logistics")}</CardTitle>
            <CardDescription>{t("users.configure_delivery_settings")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enable_parcel_system">{t("users.enable_parcel_system")}</Label>
              <Switch
                id="enable_parcel_system"
                checked={settings.enable_parcel_system}
                onCheckedChange={() => handleToggle("enable_parcel_system")}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enable_auto_assign_deliveryman">
                {t("users.enable_auto_assign_deliveryman")}
              </Label>
              <Switch
                id="enable_auto_assign_deliveryman"
                checked={settings.enable_auto_assign_deliveryman}
                onCheckedChange={() =>
                  handleToggle("enable_auto_assign_deliveryman")
                }
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enable_driver_to_edit_credentials">
                {t("users.enable_driver_to_edit_credentials")}
              </Label>
              <Switch
                id="enable_driver_to_edit_credentials"
                checked={settings.enable_driver_to_edit_credentials}
                onCheckedChange={() =>
                  handleToggle("enable_driver_to_edit_credentials")
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("users.vendor_products")}</CardTitle>
            <CardDescription>{t("users.manage_vendor_permissions")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="auto_approve_products">
                {t("users.auto_approve_products")}
              </Label>
              <Switch
                id="auto_approve_products"
                checked={settings.auto_approve_products}
                onCheckedChange={() => handleToggle("auto_approve_products")}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="auto_approve_categories">
                {t("users.auto_approve_categories")}
              </Label>
              <Switch
                id="auto_approve_categories"
                checked={settings.auto_approve_categories}
                onCheckedChange={() => handleToggle("auto_approve_categories")}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enable_vendor_subscriptions">
                {t("users.enable_vendor_subscriptions")}
              </Label>
              <Switch
                id="enable_vendor_subscriptions"
                checked={settings.enable_vendor_subscriptions}
                onCheckedChange={() =>
                  handleToggle("enable_vendor_subscriptions")
                }
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enable_commission_model">
                {t("users.enable_commission_model")}
              </Label>
              <Switch
                id="enable_commission_model"
                checked={settings.enable_commission_model}
                onCheckedChange={() => handleToggle("enable_commission_model")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("users.features_modules")}</CardTitle>
            <CardDescription>{t("users.toggle_major_system_modules")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2 border-l-4 border-primary pl-4 bg-muted/50 p-2 rounded-r-md">
              <div className="space-y-0.5">
                <Label htmlFor="enable_paas_lending" className="font-bold">
                  {t("users.enable_paas_lending")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("users.activates_the_lending_and_loan_management_module")}
                </p>
              </div>
              <Switch
                id="enable_paas_lending"
                checked={settings.enable_paas_lending}
                onCheckedChange={() => handleToggle("enable_paas_lending")}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enable_reservations">
                {t("users.enable_reservation_system")}
              </Label>
              <Switch
                id="enable_reservations"
                checked={settings.enable_reservations}
                onCheckedChange={() => handleToggle("enable_reservations")}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enable_referral_earnings">
                {t("users.enable_referral_earnings")}
              </Label>
              <Switch
                id="enable_referral_earnings"
                checked={settings.enable_referral_earnings}
                onCheckedChange={() => handleToggle("enable_referral_earnings")}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="blog_active">{t("users.blog_active")}</Label>
              <Switch
                id="blog_active"
                checked={settings.blog_active}
                onCheckedChange={() => handleToggle("blog_active")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("users.system_misc")}</CardTitle>
            <CardDescription>{t("users.other_system_settings")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="prompt_email_modal">{t("users.prompt_email_modal")}</Label>
              <Switch
                id="prompt_email_modal"
                checked={settings.prompt_email_modal}
                onCheckedChange={() => handleToggle("prompt_email_modal")}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="aws_active">{t("users.aws_active")}</Label>
              <Switch
                id="aws_active"
                checked={settings.aws_active}
                onCheckedChange={() => handleToggle("aws_active")}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
