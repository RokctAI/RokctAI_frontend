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

import { RiAddLine, RiDeleteBinLine } from "@remixicon/react";
import { useEffect, useState } from "react";

import { listTemplates } from "@/app/actions/studio/requests/actions";
import type { PosterTemplate } from "@/app/actions/studio/requests/types";
import { Button } from "@/components/ui/button";

export type PosterItem = { title: string; price: string; photo?: File };

export type PosterValues = {
  template: string;
  fields: Record<string, string>;
  photos: Record<string, File>;
  items: PosterItem[];
  backgroundPrompt: string;
};

export const emptyPoster: PosterValues = { template: "", fields: {}, photos: {}, items: [], backgroundPrompt: "" };

/** Every slot the chosen template marks required has a value. */
export function posterReady(template: PosterTemplate | undefined, v: PosterValues) {
  if (!template) return false;
  const slotsOk = template.slots.every((s) =>
    !s.required || (s.kind === "image" ? Boolean(v.photos[s.slot]) : (v.fields[s.slot] ?? "").trim() !== ""),
  );
  const itemsOk = !template.items?.required || v.items.some((i) => i.title.trim() !== "");
  return slotsOk && itemsOk;
}

/**
 * Poster form: the merchant types their own words and prices and picks
 * their own photos; the template places them by code. Only the
 * background can come from the image model.
 */
export function TemplateFields({
  value,
  onChange,
  onTemplates,
}: {
  value: PosterValues;
  onChange: (v: PosterValues) => void;
  onTemplates?: (t: PosterTemplate[]) => void;
}) {
  const [templates, setTemplates] = useState<PosterTemplate[]>([]);
  useEffect(() => {
    listTemplates().then((t) => {
      setTemplates(t);
      onTemplates?.(t);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chosen = templates.find((t) => t.name === value.template);
  const set = (patch: Partial<PosterValues>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3">
        {templates.map((t) => (
          <button
            key={t.name}
            type="button"
            className={`rounded-md border p-3 text-left ${value.template === t.name ? "border-primary ring-1 ring-primary" : ""}`}
            onClick={() => set({ template: t.name })}
          >
            <div className="font-medium">{t.label}</div>
            <div className="text-sm text-muted-foreground">{t.description}</div>
          </button>
        ))}
      </div>
      {chosen?.slots
        .filter((s) => s.slot !== "background")
        .map((s) => (
          <label key={s.slot} className="block space-y-1">
            <span className="text-sm">
              {s.label}
              {s.required ? " *" : ""}
            </span>
            {s.kind === "image" ? (
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  const photos = { ...value.photos };
                  if (f) photos[s.slot] = f;
                  else delete photos[s.slot];
                  set({ photos });
                }}
              />
            ) : (
              <input
                className="w-full rounded-md border p-2"
                value={value.fields[s.slot] ?? ""}
                onChange={(e) => set({ fields: { ...value.fields, [s.slot]: e.target.value } })}
              />
            )}
          </label>
        ))}
      {chosen?.items && (
        <div className="space-y-2">
          <span className="text-sm">Items{chosen.items.required ? " *" : ""}</span>
          {value.items.map((item, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                className="flex-1 rounded-md border p-2"
                placeholder="Name"
                value={item.title}
                onChange={(e) => set({ items: value.items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })}
              />
              <input
                className="w-28 rounded-md border p-2"
                placeholder="Price"
                value={item.price}
                onChange={(e) => set({ items: value.items.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)) })}
              />
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={(e) =>
                  set({ items: value.items.map((x, j) => (j === i ? { ...x, photo: e.target.files?.[0] } : x)) })
                }
              />
              <Button variant="ghost" size="icon" onClick={() => set({ items: value.items.filter((_, j) => j !== i) })}>
                <RiDeleteBinLine className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => set({ items: [...value.items, { title: "", price: "" }] })}>
            <RiAddLine className="mr-2 h-4 w-4" />
            Add item
          </Button>
        </div>
      )}
      {chosen?.slots.some((s) => s.slot === "background") && (
        <label className="block space-y-1">
          <span className="text-sm">Background idea (optional, made by AI)</span>
          <input
            className="w-full rounded-md border p-2"
            placeholder="e.g. soft blurred market stalls"
            value={value.backgroundPrompt}
            onChange={(e) => set({ backgroundPrompt: e.target.value })}
          />
        </label>
      )}
    </div>
  );
}
