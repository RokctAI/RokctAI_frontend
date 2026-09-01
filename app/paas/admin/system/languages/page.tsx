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

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getLanguages, updateLanguage } from "@/app/actions/paas/admin/system";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchLanguages();
  }, []);

  async function fetchLanguages() {
    try {
      const data = await getLanguages();
      setLanguages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching languages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(lang: any, enabled: boolean) {
    setSaving(lang.name);
    try {
      await updateLanguage(lang.name, { enabled: enabled ? 1 : 0 });
      setLanguages((prev) =>
        prev.map((l) =>
          l.name === lang.name ? { ...l, enabled: enabled ? 1 : 0 } : l,
        ),
      );
      toast.success(
        `${lang.language_name || lang.name} ${enabled ? "enabled" : "disabled"}`,
      );
    } catch (error) {
      toast.error("Failed to update language");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Languages</h1>
        <p className="text-muted-foreground">
          Enable the languages available for translation across the platform.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Language</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-[100px]">Enabled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="size-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : languages.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No languages found.
                </TableCell>
              </TableRow>
            ) : (
              languages.map((lang) => (
                <TableRow key={lang.name}>
                  <TableCell className="font-medium">
                    {lang.language_name}
                  </TableCell>
                  <TableCell>{lang.language_code || lang.name}</TableCell>
                  <TableCell>
                    <Badge variant={lang.enabled ? "default" : "secondary"}>
                      {lang.enabled ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={Boolean(lang.enabled)}
                        disabled={saving === lang.name}
                        onCheckedChange={(checked) =>
                          handleToggle(lang, checked)
                        }
                      />
                      {saving === lang.name && (
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
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
