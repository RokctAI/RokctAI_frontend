"use client";

import { Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import t from "@/app/lib/i18n";

import {
  getDeliverySettings,
  updateDeliverySettings,
} from "@/app/actions/paas/admin/logistics";
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
import { Switch } from "@/components/ui/switch";

export default function DeliverymanSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await getDeliverySettings();
      if (data) {
        setFormData(data);
      }
    } catch (error) {
      toast.error(t('paas.admin.logistics.deliveryman_settings.toast_load_fail'));
    } finally {
      setLoading(false);
    }
  }
 
  async function handleSave() {
    try {
      await updateDeliverySettings(formData);
      toast.success(t('paas.admin.logistics.deliveryman_settings.toast_save_success'));
    } catch (error) {
      toast.error(t('paas.admin.logistics.deliveryman_settings.toast_save_fail'));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t('paas.admin.logistics.deliveryman_settings.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('paas.admin.logistics.deliveryman_settings.desc')}
        </p>
      </div>
 
      <Card>
        <CardHeader>
          <CardTitle>{t('paas.admin.logistics.deliveryman_settings.card_title')}</CardTitle>
          <CardDescription>
            {t('paas.admin.logistics.deliveryman_settings.card_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('paas.admin.logistics.deliveryman_settings.label_search_radius')}</Label>
              <Input
                type="number"
                value={formData.search_radius || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    search_radius: parseFloat(e.target.value),
                  })
                }
                placeholder={t('paas.admin.logistics.deliveryman_settings.ph_search_radius')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('paas.admin.logistics.deliveryman_settings.label_max_orders')}</Label>
              <Input
                type="number"
                value={formData.max_orders || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_orders: parseInt(e.target.value),
                  })
                }
                placeholder={t('paas.admin.logistics.deliveryman_settings.ph_max_orders')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('paas.admin.logistics.deliveryman_settings.label_base_fee')}</Label>
              <Input
                type="number"
                value={formData.base_fee || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    base_fee: parseFloat(e.target.value),
                  })
                }
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('paas.admin.logistics.deliveryman_settings.label_fee_per_km')}</Label>
              <Input
                type="number"
                value={formData.fee_per_km || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fee_per_km: parseFloat(e.target.value),
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>
 
          <div className="flex items-center space-x-2 pt-4">
            <Switch
              checked={!!formData.auto_assign}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, auto_assign: checked ? 1 : 0 })
              }
            />
            <Label>{t('paas.admin.logistics.deliveryman_settings.label_auto_assign')}</Label>
          </div>
        </CardContent>
      </Card>
 
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="mr-2 size-4" />
          {t('paas.admin.logistics.deliveryman_settings.btn_save')}
        </Button>
      </div>
    </div>
  );
}
