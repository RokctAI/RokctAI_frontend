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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RiSaveLine } from "@remixicon/react";
import { toast } from "sonner";

import t from "@/app/lib/i18n";
export default function CrmSettingsPage() {
  // Placeholder save
  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("crm.crm_settings")}</h1>
          <p className="text-muted-foreground">
            {t("crm.manage_your_crm_preferences_and_default_configur")}
          </p>
        </div>
        <Button onClick={handleSave}>
          <RiSaveLine className="mr-2 h-4 w-4" />
          {t("crm.save_changes")}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t("crm.general")}</CardTitle>
            <CardDescription>
              {t("crm.basic_configuration_for_your_crm_workspace")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("crm.enable_desktop_notifications")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("crm.receive_browser_notifications_for_new_leads_and_")}
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("crm.dark_mode_default")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("crm.force_dark_mode_for_all_crm_pages")}
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t("crm.pipeline_defaults")}</CardTitle>
            <CardDescription>
              {t("crm.set_default_stages_and_probabilities_for_new_opp")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("crm.auto_create_task_on_new_deal")}</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically create a follow-up task when a new deal is
                  added.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
