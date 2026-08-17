/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  getSystemSettings,
  updateSystemSettings,
} from "@/app/actions/handson/all/settings/general";

export function SystemSettingsForm() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSystemSettings().then((res) => {
      if (res) setSettings(res);
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const res = await updateSystemSettings(settings);
    if (res.success) toast.success("System Settings Updated");
    else toast.error("Failed to update settings");
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>Global system configuration.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Country</Label>
            <Input
              value={settings.country || ""}
              onChange={(e) =>
                setSettings({ ...settings, country: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Time Zone</Label>
            <Input
              value={settings.time_zone || ""}
              onChange={(e) =>
                setSettings({ ...settings, time_zone: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Language</Label>
            <Input
              value={settings.language || ""}
              onChange={(e) =>
                setSettings({ ...settings, language: e.target.value })
              }
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
