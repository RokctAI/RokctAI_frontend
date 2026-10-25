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

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { uploadFile } from "@/app/actions/studio/requests/actions";
import { deriveDesignSystem, extractPalette } from "@/app/actions/studio/systems/actions";
import { Button } from "@/components/ui/button";

import { toBase64 } from "../../components/to-base64";

// Two or three brand colours in, a full WCAG-safe design system out.
// Colours can be typed or picked from an uploaded logo.
export default function NewDesignSystemPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [seeds, setSeeds] = useState<string[]>(["#1f3a93", "#f5a623"]);
  const [palette, setPalette] = useState<{ hex: string; coverage: number }[]>([]);
  const [busy, setBusy] = useState(false);

  async function onLogo(file: File | undefined) {
    if (!file) return;
    try {
      const { file_url } = await uploadFile(await toBase64(file), file.name);
      setPalette(await extractPalette(file_url));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read the colours");
    }
  }

  function toggle(hex: string) {
    setSeeds((s) => (s.includes(hex) ? s.filter((x) => x !== hex) : [...s, hex].slice(-3)));
  }

  async function create() {
    setBusy(true);
    try {
      const system = await deriveDesignSystem(seeds, name);
      router.push(`/studio/systems/${encodeURIComponent(system.name)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the design system");
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-5 p-6">
      <h1 className="text-2xl font-semibold">New design system</h1>
      <input className="w-full rounded-md border p-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="space-y-2">
        <div className="text-sm">Brand colours (2 or 3)</div>
        <div className="flex flex-wrap gap-3">
          {seeds.map((hex, i) => (
            <input
              key={i}
              type="color"
              value={hex}
              onChange={(e) => setSeeds((s) => s.map((x, j) => (j === i ? e.target.value : x)))}
            />
          ))}
          {seeds.length < 3 && <Button variant="outline" onClick={() => setSeeds((s) => [...s, "#333333"])}>Add colour</Button>}
          {seeds.length > 2 && <Button variant="outline" onClick={() => setSeeds((s) => s.slice(0, -1))}>Remove</Button>}
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm">Or pick them from a logo</div>
        <input type="file" accept=".png,.jpg,.jpeg,.webp,.svg" onChange={(e) => onLogo(e.target.files?.[0])} />
        <div className="flex flex-wrap gap-2">
          {palette.map((p) => (
            <button
              key={p.hex}
              title={`${p.hex} · ${Math.round(p.coverage * 100)}%`}
              className={`h-10 w-10 rounded-md border-2 ${seeds.includes(p.hex) ? "border-primary" : "border-transparent"}`}
              style={{ background: p.hex }}
              onClick={() => toggle(p.hex)}
            />
          ))}
        </div>
      </div>
      <Button disabled={!name.trim() || seeds.length < 2 || busy} onClick={create}>Create</Button>
    </div>
  );
}
