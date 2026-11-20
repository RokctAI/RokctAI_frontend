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

import { RiServerLine, RiCheckboxCircleLine } from "@remixicon/react";
import { useEffect, useState } from "react";

import { getSystemInfo } from "@/app/actions/base/admin/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import t from "@/app/lib/i18n";
export default function AdminSystemInfoPage() {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">{t("base.system_information")}</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">{t("base.api_status")}</CardTitle>
            <RiCheckboxCircleLine className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {info?.message || "Online"}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("base.system_is_operational")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">{t("base.app_version")}</CardTitle>
            <RiServerLine className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {info?.version || "v1.0.0"}
            </div>
            <p className="text-xs text-muted-foreground">{t("base.current_deployment")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
