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
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getShop, updateShop } from "@/app/actions/merchants/shop";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import t from "@/app/lib/i18n";
export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    phone: "",
    min_amount: 0,
    tax: 0,
    delivery_time_type: "minutes",
    delivery_time_from: 0,
    delivery_time_to: 0,
    logo_img: "",
    background_img: "",
    enable_cod: true,
  });

  useEffect(() => {
    async function fetchShop() {
      try {
        const shop = await getShop();
        if (shop) {
          setFormData({
            title: shop.title || "",
            description: shop.description || "",
            address: shop.address || "",
            phone: shop.phone || "",
            min_amount: shop.min_amount || 0,
            tax: shop.tax || 0,
            delivery_time_type: shop.delivery_time?.type || "minutes",
            delivery_time_from: shop.delivery_time?.from || 0,
            delivery_time_to: shop.delivery_time?.to || 0,
            logo_img: shop.logo_img || "",
            background_img: shop.background_img || "",
            enable_cod: shop.enable_cod ?? true,
          });
        }
      } catch (error) {
        console.error("Error fetching shop:", error);
        toast.error("Failed to load shop settings");
      } finally {
        setLoading(false);
      }
    }
    fetchShop();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateShop(formData);
      toast.success("Shop settings updated successfully");
    } catch (error) {
      console.error("Error updating shop:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RiLoader4Line className="size-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">{t("merchants.shop_settings")}</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("merchants.general_information")}</CardTitle>
            <CardDescription>{t("merchants.basic_details_about_your_shop")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("merchants.shop_name")}</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("merchants.description")}</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t("merchants.phone")}</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t("merchants.address")}</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("merchants.delivery_pricing")}</CardTitle>
            <CardDescription>
              {t("merchants.configure_delivery_times_and_pricing_rules")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_time_from">{t("merchants.delivery_time_from")}</Label>
                <Input
                  id="delivery_time_from"
                  name="delivery_time_from"
                  type="number"
                  value={formData.delivery_time_from}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_time_to">{t("merchants.delivery_time_to")}</Label>
                <Input
                  id="delivery_time_to"
                  name="delivery_time_to"
                  type="number"
                  value={formData.delivery_time_to}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_time_type">{t("merchants.unit")}</Label>
                <select
                  id="delivery_time_type"
                  name="delivery_time_type"
                  value={formData.delivery_time_type}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="minutes">{t("merchants.minutes")}</option>
                  <option value="hours">{t("merchants.hours")}</option>
                  <option value="days">{t("merchants.days")}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_amount">{t("merchants.minimum_order_amount")}</Label>
                <Input
                  id="min_amount"
                  name="min_amount"
                  type="number"
                  value={formData.min_amount}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">{t("merchants.tax")}</Label>
                <Input
                  id="tax"
                  name="tax"
                  type="number"
                  value={formData.tax}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("merchants.images")}</CardTitle>
            <CardDescription>
              {t("merchants.update_your_shop_logo_and_cover_photo")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo_img">{t("merchants.logo_url")}</Label>
              <Input
                id="logo_img"
                name="logo_img"
                value={formData.logo_img}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="background_img">{t("merchants.cover_photo_url")}</Label>
              <Input
                id="background_img"
                name="background_img"
                value={formData.background_img}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("merchants.payment_settings")}</CardTitle>
            <CardDescription>
              {t("merchants.configure_accepted_payment_methods")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">{t("merchants.cash_on_delivery_cod")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("merchants.allow_customers_to_pay_with_cash_upon_delivery")}
                </p>
              </div>
              <Switch
                checked={formData.enable_cod}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, enable_cod: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? (
              <>
                <RiLoader4Line className="mr-2 size-4 animate-spin" />
                {t("merchants.saving")}
              </>
            ) : (
              <>
                <RiSaveLine className="mr-2 size-4" />
                {t("merchants.save_changes")}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
