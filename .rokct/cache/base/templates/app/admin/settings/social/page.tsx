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

import { getSocialSettings } from "@/app/actions/base/admin/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import t from "@/app/lib/i18n";
export default function SocialSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getSocialSettings();
        setSettings(data);
      } catch (error) {
        console.error("Error fetching social settings:", error);
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
        <h1 className="text-3xl font-bold">{t("base.social_media_settings")}</h1>
        <Button>
          <RiSaveLine className="mr-2 size-4" />
          {t("base.save_changes")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("base.social_links")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("base.facebook_url")}</Label>
            <Input
              defaultValue={settings.facebook_url}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label>{t("base.twitter_url")}</Label>
            <Input
              defaultValue={settings.twitter_url}
              placeholder="https://twitter.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label>{t("base.instagram_url")}</Label>
            <Input
              defaultValue={settings.instagram_url}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label>{t("base.linkedin_url")}</Label>
            <Input
              defaultValue={settings.linkedin_url}
              placeholder="https://linkedin.com/..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
