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

import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { getSocialSettings } from "@/app/actions/paas/admin/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        <Loader2 className="size-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Social Media Settings</h1>
        <Button>
          <Save className="mr-2 size-4" />
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Facebook URL</Label>
            <Input
              defaultValue={settings.facebook_url}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label>Twitter URL</Label>
            <Input
              defaultValue={settings.twitter_url}
              placeholder="https://twitter.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label>Instagram URL</Label>
            <Input
              defaultValue={settings.instagram_url}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn URL</Label>
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
