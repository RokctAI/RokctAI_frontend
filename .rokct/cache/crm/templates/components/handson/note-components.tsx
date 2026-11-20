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
import { RiAddLine, RiFileTextLine, RiSearchLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { createNote } from "@/app/actions/handson/all/crm/support/note"; // Importing from commercial as per decision
import { toast } from "sonner";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import t from "@/app/lib/i18n";
export function NoteList({ notes }: { notes: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = notes.filter((n) =>
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("crm.crm_notes")}</h1>
          <p className="text-muted-foreground">
            {t("crm.log_interactions_and_internal_notes")}
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/handson/all/commercial/crm/note/new">
            <Button>
              <RiAddLine className="mr-2 h-4 w-4" /> {t("crm.new_note")}
            </Button>
          </Link>
        </div>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("crm.title")}</TableHead>
              <TableHead>{t("crm.public")}</TableHead>
              <TableHead>{t("crm.last_modified")}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((n) => (
              <TableRow key={n.name}>
                <TableCell className="font-medium flex items-center gap-2">
                  <RiFileTextLine className="h-4 w-4 text-muted-foreground" />
                  {n.title}
                </TableCell>
                <TableCell>{n.public ? "Yes" : "No"}</TableCell>
                <TableCell>{n.modified}</TableCell>
                <TableCell>{/* View/Edit Link could go here */}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function NoteForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    const res = await createNote({ title, content, public: false });
    if (res.success) {
      toast.success("Note Created");
      router.push("/handson/all/commercial/crm/note");
    } else toast.error(res.error);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">{t("crm.new_note")}</h1>
        <Button onClick={handleSubmit}>{t("crm.save_note")}</Button>
      </div>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div>
            <Label>{t("crm.title")}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("crm.subject")}
            />
          </div>
          <div>
            <Label>{t("crm.content")}</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder={t("crm.details")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
