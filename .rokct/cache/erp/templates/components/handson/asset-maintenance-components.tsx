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
import { useState } from "react";
import Link from "next/link";
import { RiAddLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Added Import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation"; // Added Import
import { createAssetMaintenance } from "@/app/actions/handson/all/accounting/assets/maintenance/createAssetMaintenance";
import t from "@/app/lib/i18n";
import { toast } from "sonner"; // Added Import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added Import
import { Label } from "@/components/ui/label"; // Added Import

export function AssetMaintenanceList({ items }: { items: any[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("erp.asset_maintenance")}</h1>
          <p className="text-muted-foreground">{t("erp.scheduled_repairs")}</p>
        </div>
        <Link href="/handson/all/financials/assets/maintenance/new">
          <Button>
            <RiAddLine className="mr-2 h-4 w-4" /> {t("erp.schedule_maintenance")}
          </Button>
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("erp.name")}</TableHead>
            <TableHead>{t("erp.asset")}</TableHead>
            <TableHead>{t("erp.team")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((o) => (
            <TableRow key={o.name}>
              <TableCell>{o.name}</TableCell>
              <TableCell>{o.asset_name}</TableCell>
              <TableCell>{o.maintenance_team}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function AssetMaintenanceForm() {
  const router = useRouter();
  const [asset, setAsset] = useState("");
  const [team, setTeam] = useState("");

  const handleSubmit = async () => {
    const res = await createAssetMaintenance({
      asset_name: asset,
      company: "Juvo",
      maintenance_team: team,
      maintenance_tasks: [{ maintenance_task: "Repair" }],
    });
    if (res.success) {
      toast.success("Maintenance Scheduled");
      router.push("/handson/all/financials/assets/maintenance");
    } else toast.error(res.error);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t("erp.maintenance_schedule")}</h1>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div>
            <Label>{t("erp.asset_name")}</Label>
            <Input value={asset} onChange={(e) => setAsset(e.target.value)} />
          </div>
          <div>
            <Label>{t("erp.team_user")}</Label>
            <Input value={team} onChange={(e) => setTeam(e.target.value)} />
          </div>
          <Button onClick={handleSubmit}>{t("erp.save_schedule")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
