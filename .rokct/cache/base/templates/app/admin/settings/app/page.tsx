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

import { RiSaveLine } from "@remixicon/react";
import { useEffect, useState } from "react";

import { getAppSettings } from "@/app/actions/base/admin/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import t from "@/app/lib/i18n";
export default function AppSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getAppSettings();
        setSettings(data);
      } catch (error) {
        console.error("Error fetching app settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("base.app_settings")}</h1>
        <Button>
          <RiSaveLine className="mr-2 size-4" />
          {t("base.save_changes")}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("base.mobile_app_links")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("base.android_app_url_play_store")}</Label>
              <Input defaultValue={settings.android_app_url} />
            </div>
            <div className="space-y-2">
              <Label>iOS App URL (App Store)</Label>
              <Input defaultValue={settings.ios_app_url} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("base.app_configuration")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("base.minimum_android_version")}</Label>
              <Input defaultValue={settings.min_android_version} />
            </div>
            <div className="space-y-2">
              <Label>{t("base.minimum_ios_version")}</Label>
              <Input defaultValue={settings.min_ios_version} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
