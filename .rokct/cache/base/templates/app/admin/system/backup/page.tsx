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

import { format } from "date-fns";
import { RiDatabase2Line, RiDownloadLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getBackups, createBackup } from "@/app/actions/base/admin/system";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import t from "@/app/lib/i18n";
export default function BackupsPage() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  async function fetchBackups() {
    try {
      const data = await getBackups();
      setBackups(data);
    } catch (error) {
      console.error("Error fetching backups:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBackup() {
    setCreating(true);
    try {
      await createBackup();
      toast.success("Backup created successfully");
      fetchBackups();
    } catch (error) {
      toast.error("Failed to create backup");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("base.database_backups")}</h1>
        <Button onClick={handleCreateBackup} disabled={creating}>
          {!creating && <RiDatabase2Line className="mr-2 size-4" />}
          Create Backup
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("base.date")}</TableHead>
              <TableHead>{t("base.size")}</TableHead>
              <TableHead>{t("base.file")}</TableHead>
              <TableHead className="text-right">{t("base.action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <span className="text-sm text-muted-foreground">Loading…</span>
                </TableCell>
              </TableRow>
            ) : backups.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t("base.no_backups_found")}
                </TableCell>
              </TableRow>
            ) : (
              backups.map((backup) => (
                <TableRow key={backup.name}>
                  <TableCell>
                    {format(new Date(backup.creation), "PPP p")}
                  </TableCell>
                  <TableCell>{backup.size_mb} MB</TableCell>
                  <TableCell className="font-mono text-sm">
                    {backup.file_name}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      <RiDownloadLine className="size-4 mr-2" />
                      {t("base.download")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
