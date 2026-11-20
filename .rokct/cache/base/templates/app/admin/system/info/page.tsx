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

import { RiDeleteBinLine, RiRefreshLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getSystemInfo, clearCache } from "@/app/actions/base/admin/system";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import t from "@/app/lib/i18n";
export default function SystemInfoPage() {
  const [info, setInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    async function fetchInfo() {
      try {
        const data = await getSystemInfo();
        setInfo(data);
      } catch (error) {
        console.error("Error fetching system info:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInfo();
  }, []);

  async function handleClearCache() {
    setClearing(true);
    try {
      await clearCache();
      toast.success("System cache cleared successfully");
    } catch (error) {
      toast.error("Failed to clear cache");
    } finally {
      setClearing(false);
    }
  }

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
        <h1 className="text-3xl font-bold">{t("base.system_information")}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RiRefreshLine className="mr-2 size-4" />
            {t("base.refresh")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleClearCache}
            disabled={clearing}
          >
            {!clearing && <RiDeleteBinLine className="mr-2 size-4" />}
            Clear Cache
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("base.application_details")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">{t("base.app_name")}</span>
              <span className="font-medium">{info.app_name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">{t("base.version")}</span>
              <span className="font-medium">{info.version}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">{t("base.framework")}</span>
              <span className="font-medium">{info.framework_version}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("base.server_status")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">{t("base.python_version")}</span>
              <span className="font-medium">{info.python_version}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">{t("base.database")}</span>
              <span className="font-medium">{info.database}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">{t("base.os")}</span>
              <span className="font-medium">{info.os}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
