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

import { getEmailSettings } from "@/app/actions/base/admin/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import t from "@/app/lib/i18n";
export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getEmailSettings();
        setSettings(data);
      } catch (error) {
        console.error("Error fetching email settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RiLoader4Line className="size-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("comms.email_provider_settings")}</h1>
        <Button>
          <RiSaveLine className="mr-2 size-4" />
          {t("comms.save_changes")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("comms.smtp_configuration")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("comms.smtp_host")}</Label>
              <Input defaultValue={settings.smtp_host} />
            </div>
            <div className="space-y-2">
              <Label>{t("comms.smtp_port")}</Label>
              <Input defaultValue={settings.smtp_port} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("comms.username")}</Label>
              <Input defaultValue={settings.smtp_username} />
            </div>
            <div className="space-y-2">
              <Label>{t("comms.password")}</Label>
              <Input type="password" defaultValue={settings.smtp_password} /> //
              placeholder
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("comms.from_email")}</Label>
            <Input defaultValue={settings.from_email} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
