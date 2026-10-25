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

import { RiLoader4Line } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createDesignRequest, uploadFile } from "@/app/actions/studio/requests/actions";
import type { PosterTemplate, TemplateData } from "@/app/actions/studio/requests/types";
import { Button } from "@/components/ui/button";

import { SystemFormatFields } from "../../components/system-format-fields";
import { emptyPoster, posterReady, TemplateFields } from "../../components/template-fields";
import { toBase64 } from "../../components/to-base64";

export default function NewRequestPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"Uploaded Artwork" | "Generated" | "Template">("Uploaded Artwork");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [system, setSystem] = useState("");
  const [format, setFormat] = useState("logo");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [poster, setPoster] = useState(emptyPoster);
  const [templates, setTemplates] = useState<PosterTemplate[]>([]);

  async function upload(f: File) {
    return (await uploadFile(await toBase64(f), f.name)).file_url;
  }

  async function templateData(): Promise<TemplateData> {
    const images: Record<string, string> = {};
    for (const [slot, f] of Object.entries(poster.photos)) images[slot] = await upload(f);
    const items = [];
    for (const i of poster.items.filter((x) => x.title.trim() !== "")) {
      items.push({ title: i.title, price: i.price, image_url: i.photo ? await upload(i.photo) : undefined });
    }
    return { fields: poster.fields, images, items, background_prompt: poster.backgroundPrompt || undefined };
  }

  async function submit() {
    setBusy(true);
    try {
      const file_urls = [];
      if (mode === "Uploaded Artwork") for (const f of files) file_urls.push(await upload(f));
      const { name } = await createDesignRequest({
        source_mode: mode,
        title: title || undefined,
        prompt: prompt || undefined,
        design_system: system || undefined,
        format,
        file_urls: mode === "Uploaded Artwork" ? file_urls : undefined,
        template: mode === "Template" ? poster.template : undefined,
        template_data: mode === "Template" ? await templateData() : undefined,
      });
      router.push(`/studio/requests/${encodeURIComponent(name)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the request");
      setBusy(false);
    }
  }

  const ready =
    mode === "Generated"
      ? prompt.trim() !== ""
      : mode === "Template"
        ? posterReady(templates.find((t) => t.name === poster.template), poster)
        : files.length > 0;
  return (
    <div className="max-w-2xl space-y-5 p-6">
      <h1 className="text-2xl font-semibold">New design</h1>
      <div className="flex gap-2">
        {(["Uploaded Artwork", "Generated", "Template"] as const).map((m) => (
          <Button key={m} variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)}>
            {m === "Generated" ? "Generate from a prompt" : m === "Template" ? "Make a poster" : "Trace my artwork"}
          </Button>
        ))}
      </div>
      <input className="w-full rounded-md border p-2" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
      {mode === "Template" ? (
        <TemplateFields value={poster} onChange={setPoster} onTemplates={setTemplates} />
      ) : mode === "Generated" ? (
        <textarea className="w-full rounded-md border p-3" rows={4} placeholder="Describe the design" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      ) : (
        <input type="file" multiple accept=".png,.jpg,.jpeg,.webp,.svg" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
      )}
      <SystemFormatFields system={system} onSystem={setSystem} format={format} onFormat={setFormat} />
      {mode === "Template" && (
        <p className="text-sm text-muted-foreground">Posters use their template&apos;s A4 size; the format above is ignored.</p>
      )}
      <Button disabled={!ready || busy} onClick={submit}>
        {busy && <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />}
        Start
      </Button>
    </div>
  );
}
