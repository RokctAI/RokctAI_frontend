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

import { use, useEffect, useState } from "react";
import { toast } from "sonner";

import { brandbook } from "@/app/actions/studio/renders/actions";
import { getDesignSystem } from "@/app/actions/studio/systems/actions";
import type { DesignSystem } from "@/app/actions/studio/systems/types";
import { Button } from "@/components/ui/button";

export default function DesignSystemPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const [system, setSystem] = useState<DesignSystem | null>(null);
  const [book, setBook] = useState<string | null>(null);

  useEffect(() => {
    getDesignSystem(name).then(setSystem).catch(() => toast.error("Could not load this design system"));
  }, [name]);

  async function makeBrandbook() {
    try {
      setBook((await brandbook(name)).pdf_url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Brand book failed");
    }
  }

  if (!system) return <p className="p-6">Loading…</p>;
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{system.system_name}</h1>
        <div className="flex items-center gap-3">
          {book && <a className="text-sm underline" href={book}>Brand book PDF</a>}
          <Button variant="outline" onClick={makeBrandbook}>Make brand book</Button>
        </div>
      </div>
      <section className="space-y-2">
        <h2 className="font-medium">Colours</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {system.tokens.map((t) => (
            <div key={t.name} className="space-y-1 text-sm">
              <div className="h-14 rounded-md border" style={{ background: t.hex }} />
              <div className="font-medium">{t.name}</div>
              <div className="text-muted-foreground">{[t.hex, t.role].filter(Boolean).join(" · ")}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="font-medium">Fonts</h2>
        <ul className="text-sm">
          {system.fonts.map((f) => (
            <li key={f.name}>
              {f.name} <span className="text-muted-foreground">{f.descriptor}</span>
            </li>
          ))}
        </ul>
      </section>
      {system.contrast && (
        <p className="text-sm text-muted-foreground">
          Contrast: text {system.contrast.min_text}:1, large text {system.contrast.min_large_text}:1
          {system.max_colors ? ` · max ${system.max_colors} colours` : ""}
        </p>
      )}
    </div>
  );
}
