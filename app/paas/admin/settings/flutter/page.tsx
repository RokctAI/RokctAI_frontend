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
import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  getFlutterAppSettings,
  updateFlutterAppSettings,
  createFlutterAppConfig,
  getFlutterBuildSettings,
  updateFlutterBuildSettings,
  getAvailableSourceProjects,
} from "@/app/actions/paas/admin/settings";
import t from "@/app/lib/i18n";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FlutterSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [appConfig, setAppConfig] = useState<any>(null);
  const [buildSettings, setBuildSettings] = useState<any>(null);
  const [sourceProjects, setSourceProjects] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("app-config");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const [apps, build, projects] = await Promise.all([
        getFlutterAppSettings(),
        getFlutterBuildSettings(),
        getAvailableSourceProjects(),
      ]);

      if (apps && apps.length > 0) {
        setAppConfig(apps[0]);
      } else {
        setAppConfig({}); // Empty object for new config
      }

      setBuildSettings(build || {});
      setSourceProjects(projects || []);
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAppConfig() {
    try {
      if (appConfig.name) {
        await updateFlutterAppSettings(appConfig.name, appConfig);
        toast.success("App configuration updated");
      } else {
        await createFlutterAppConfig(appConfig);
        toast.success("App configuration created");
        loadSettings(); // Reload to get the new name
      }
    } catch (error) {
      toast.error("Failed to save app configuration");
    }
  }

  async function handleSaveBuildSettings() {
    try {
      await updateFlutterBuildSettings(buildSettings);
      toast.success("Build settings updated");
    } catch (error) {
      toast.error("Failed to save build settings");
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
          {t("app.paas.admin.settings.flutter.title")}
        </h2>
        <p className="text-muted-foreground">
          Manage your Flutter application configuration and build settings.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="app-config">App Configuration</TabsTrigger>
          <TabsTrigger value="build-settings">Build Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="app-config">
          <Card>
            <CardHeader>
              <CardTitle>App Configuration</CardTitle>
              <CardDescription>
                Configure your mobile application details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>App Display Name</Label>
                  <Input
                    value={appConfig?.app_display_name || ""}
                    onChange={(e) =>
                      setAppConfig({
                        ...appConfig,
                        app_display_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Package Name (Android)</Label>
                  <Input
                    value={appConfig?.package_name || ""}
                    onChange={(e) =>
                      setAppConfig({
                        ...appConfig,
                        package_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Package Name (iOS)</Label>
                  <Input
                    value={appConfig?.ios_package_name || ""}
                    onChange={(e) =>
                      setAppConfig({
                        ...appConfig,
                        ios_package_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Source Project</Label>
                  <Select
                    value={appConfig?.source_project || ""}
                    onValueChange={(val) =>
                      setAppConfig({ ...appConfig, source_project: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          "app.paas.admin.settings.flutter.ph_source_project",
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceProjects.map((project: any) => (
                        <SelectItem key={project.value} value={project.value}>
                          {project.label}
                        </SelectItem>
                      ))}
                      {sourceProjects.length === 0 && (
                        <SelectItem value="none" disabled>
                          {t("app.paas.admin.settings.flutter.no_projects")}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Admin Page URL</Label>
                  <Input
                    value={appConfig?.admin_page_url || ""}
                    onChange={(e) =>
                      setAppConfig({
                        ...appConfig,
                        admin_page_url: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Web URL</Label>
                  <Input
                    value={appConfig?.web_url || ""}
                    onChange={(e) =>
                      setAppConfig({ ...appConfig, web_url: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveAppConfig}>
                  <Save className="mr-2 size-4" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="build-settings">
          <Card>
            <CardHeader>
              <CardTitle>Build Settings</CardTitle>
              <CardDescription>
                Configure the build environment for your Flutter apps.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Flutter SDK Path</Label>
                <Input
                  value={buildSettings?.flutter_sdk_path || ""}
                  onChange={(e) =>
                    setBuildSettings({
                      ...buildSettings,
                      flutter_sdk_path: e.target.value,
                    })
                  }
                  placeholder="/opt/flutter"
                />
                <p className="text-xs text-muted-foreground">
                  The absolute path to the root of the Flutter SDK directory.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveBuildSettings}>
                  <Save className="mr-2 size-4" />
                  Save Build Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
