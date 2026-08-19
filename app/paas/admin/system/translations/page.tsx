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

import { Loader2, Save, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  getTranslations,
  updateTranslation,
} from "@/app/actions/paas/admin/system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import t from "@/app/lib/i18n";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TranslationsPage() {
  const [loading, setLoading] = useState(true);
  const [translations, setTranslations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    loadTranslations();
  }, []);

  async function loadTranslations() {
    try {
      const data = await getTranslations();
      setTranslations(data);
    } catch (error) {
      toast.error("Failed to load translations");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(id: string) {
    try {
      await updateTranslation(id, editValue);
      toast.success("Translation updated successfully");
      setEditingId(null);
      loadTranslations();
    } catch (error) {
      toast.error("Failed to update translation");
    }
  }

  const filteredTranslations = translations.filter(
    (t) =>
      t.key.toLowerCase().includes(search.toLowerCase()) ||
      t.value.toLowerCase().includes(search.toLowerCase()) ||
      t.group.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Translations</h2>
          <p className="text-muted-foreground">
            Manage system translations and localization.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Translations</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder={t("app.paas.admin.system.translations.ph_search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Locale</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTranslations.map((t) => (
                <TableRow key={t.name}>
                  <TableCell>
                    <Badge variant="outline">{t.group}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {t.identifier || t.key}
                  </TableCell>{" "}
                  // placeholder
                  <TableCell>{t.locale}</TableCell>
                  <TableCell>
                    {editingId === t.name ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      t.value
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === t.name ? (
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleSave(t.name)}>
                          <Save className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(t.name);
                          setEditValue(t.value);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
