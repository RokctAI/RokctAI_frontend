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

import { ChevronLeft, ChevronRight, Loader2, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createTranslation,
  getLanguages,
  getTranslations,
  updateTranslation,
  type TranslationRow,
} from "@/app/actions/paas/admin/system";
import t from "@/app/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PER_PAGE = 20;

interface EnabledLanguage {
  /** Locale code, e.g. "en" — the Language doc name. */
  code: string;
  label: string;
}

interface EditorState {
  mode: "create" | "edit";
  key: string;
  group: string;
  values: Record<string, string>;
  /** Locales rendered in the editor: enabled languages plus any locale
   * that already has a row for this key (so saving never drops data for
   * a since-disabled language). */
  locales: EnabledLanguage[];
}

export default function TranslationsPage() {
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState<EnabledLanguage[]>([]);
  const [translations, setTranslations] = useState<
    Record<string, TranslationRow[]>
  >({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [query, setQuery] = useState({ search: "", group: "" });
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);

  // Debounce the search/group inputs into the effective query.
  useEffect(() => {
    const handle = setTimeout(() => {
      setQuery({ search: search.trim(), group: groupFilter.trim() });
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [search, groupFilter]);

  useEffect(() => {
    let cancelled = false;
    async function fetchLanguages() {
      try {
        const data = await getLanguages();
        if (cancelled) return;
        const enabled = (Array.isArray(data) ? data : [])
          .filter((lang: any) => lang.enabled)
          .map((lang: any) => ({
            code: lang.name,
            label: lang.language_name || lang.name,
          }));
        setLanguages(enabled);
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    }
    fetchLanguages();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadTranslations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTranslations({
        search: query.search || undefined,
        group: query.group || undefined,
        page,
        perPage: PER_PAGE,
      });
      setTranslations(data.translations || {});
      setTotal(data.total || 0);
    } catch (error) {
      toast.error("Failed to load translations");
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    loadTranslations();
  }, [loadTranslations]);

  const keys = useMemo(() => Object.keys(translations), [translations]);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  function editorLocales(rows: TranslationRow[]): EnabledLanguage[] {
    const known = new Map(languages.map((l) => [l.code, l]));
    const result: EnabledLanguage[] = [...languages];
    for (const row of rows) {
      if (!known.has(row.locale)) {
        result.push({ code: row.locale, label: row.locale });
        known.set(row.locale, { code: row.locale, label: row.locale });
      }
    }
    return result;
  }

  function openEditor(key: string, rows: TranslationRow[]) {
    const values: Record<string, string> = {};
    for (const row of rows) values[row.locale] = row.value;
    setEditor({
      mode: "edit",
      key,
      group: rows[0]?.group || "web",
      values,
      locales: editorLocales(rows),
    });
  }

  function openCreate() {
    setEditor({
      mode: "create",
      key: "",
      group: "web",
      values: {},
      locales: [...languages],
    });
  }

  async function handleSave() {
    if (!editor) return;
    const key = editor.key.trim();
    const group = editor.group.trim();
    if (!key || !group) {
      toast.error("Key and group are required");
      return;
    }
    const hasValue = Object.values(editor.values).some(
      (v) => typeof v === "string" && v.trim() !== "",
    );
    if (!hasValue) {
      toast.error("Enter a value for at least one language");
      return;
    }
    setSaving(true);
    try {
      if (editor.mode === "create") {
        await createTranslation(group, key, editor.values);
        toast.success("Translation key created");
      } else {
        await updateTranslation(key, group, editor.values);
        toast.success("Translations updated");
      }
      setEditor(null);
      loadTranslations();
    } catch (error) {
      toast.error(
        editor.mode === "create"
          ? "Failed to create translation"
          : "Failed to update translations",
      );
    } finally {
      setSaving(false);
    }
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
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          New key
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>All Translations</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filter by group..."
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="w-40"
              />
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder={t(
                    "app.paas.admin.system.translations.ph_search",
                  )}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="size-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Languages</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No translations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  keys.map((key) => {
                    const rows = translations[key] || [];
                    return (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{key}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {rows[0]?.group || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {rows.map((row) => (
                              <Badge key={row.id} variant="secondary">
                                {row.locale}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditor(key, rows)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              {total} key{total === 1 ? "" : "s"} · page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={editor !== null}
        onOpenChange={(open) => {
          if (!open) setEditor(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editor?.mode === "create"
                ? "New translation key"
                : `Edit "${editor?.key}"`}
            </DialogTitle>
          </DialogHeader>
          {editor && (
            <div className="space-y-4 py-4">
              {editor.mode === "create" && (
                <div className="space-y-2">
                  <Label>Key</Label>
                  <Input
                    value={editor.key}
                    onChange={(e) =>
                      setEditor({ ...editor, key: e.target.value })
                    }
                    placeholder="e.g. app.web.home.title"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Group</Label>
                <Input
                  value={editor.group}
                  onChange={(e) =>
                    setEditor({ ...editor, group: e.target.value })
                  }
                  placeholder="e.g. web"
                />
              </div>
              {editor.locales.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No enabled languages found. Enable a language first.
                </p>
              ) : (
                editor.locales.map((lang) => (
                  <div key={lang.code} className="space-y-2">
                    <Label>
                      {lang.label}{" "}
                      <span className="text-muted-foreground">
                        ({lang.code})
                      </span>
                    </Label>
                    <Input
                      value={editor.values[lang.code] ?? ""}
                      onChange={(e) =>
                        setEditor({
                          ...editor,
                          values: {
                            ...editor.values,
                            [lang.code]: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                ))
              )}
              <p className="text-xs text-muted-foreground">
                Languages left blank are omitted so the app falls back to its
                default language.
              </p>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editor.mode === "create" ? "Create" : "Save"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
