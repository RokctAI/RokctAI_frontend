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

import { Loader2, Save, Map } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getDeliverySettings,
  updateDeliverySettings,
  getDeliveryZones,
} from "@/app/actions/paas/delivery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function DeliveryProfilePage() {
  const [settings, setSettings] = useState<any>({});
  const [zones, setZones] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsData, zonesData] = await Promise.all([
          getDeliverySettings(),
          getDeliveryZones(),
        ]);
        setSettings(settingsData || {});
        setZones(zonesData || []);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDeliverySettings(settings);
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Profile & Settings</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="active" className="flex flex-col space-y-1">
                <span>Active Status</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Toggle to show yourself as available for new orders.
                </span>
              </Label>
              <Switch
                id="active"
                checked={settings.is_active === 1}
                onCheckedChange={(checked) =>
                  setSettings((prev: any) => ({
                    ...prev,
                    is_active: checked ? 1 : 0,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="auto-accept" className="flex flex-col space-y-1">
                <span>Auto-Accept Orders</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Automatically accept assigned orders.
                </span>
              </Label>
              <Switch
                id="auto-accept"
                checked={settings.auto_accept === 1}
                onCheckedChange={(checked) =>
                  setSettings((prev: any) => ({
                    ...prev,
                    auto_accept: checked ? 1 : 0,
                  }))
                }
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Zones</CardTitle>
          </CardHeader>
          <CardContent>
            {zones.length === 0 ? (
              <p className="text-muted-foreground">
                No delivery zones assigned.
              </p>
            ) : (
              <ul className="space-y-2">
                {zones.map((zone) => (
                  <li
                    key={zone}
                    className="flex items-center gap-2 p-2 border rounded-md"
                  >
                    <Map className="size-4 text-muted-foreground" />
                    <span>{zone}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
