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


// A local-data site's WhatsApp order form (data/order.json). It sends
// nothing itself: it composes a WhatsApp message from the fields and opens
// wa.me with it, so the order lands where the business already takes
// orders. The live preview shows the typed business name on the label, and
// the price of the tier the quantity falls in (data/pricing.json minQty).
"use client";

import React, { useMemo, useState } from "react";

import type { SiteOrder, SitePriceTier } from "@/lib/site-data/kinds";

import { Bottle, WhatsAppGlyph } from "./site-art";

/** The tier a quantity falls in: the highest minQty not above it, else the lowest. */
export function tierFor(tiers: SitePriceTier[], qty: number): SitePriceTier | undefined {
  const sorted = [...tiers].sort((a, b) => (a.minQty ?? 0) - (b.minQty ?? 0));
  const fits = sorted.filter((t) => (t.minQty ?? 0) <= qty);
  return fits[fits.length - 1] ?? sorted[0];
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? "");
}

export function SiteOrderForm({ order, tiers, chat }: { order: SiteOrder; tiers: SitePriceTier[]; chat: string }) {
  const { fields, message } = order;
  const [business, setBusiness] = useState("");
  const [qty, setQty] = useState("");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [fileName, setFileName] = useState("");

  const n = Number(qty);
  const href = useMemo(() => {
    const tier = n > 0 ? tierFor(tiers, n) : undefined;
    const lines = [
      order.intro,
      business && fill(message.business, { value: business }),
      qty && fill(message.quantity, { value: qty }) + (tier && message.quantityPrice ? fill(message.quantityPrice, { price: tier.price }) : ""),
      area && fill(message.area, { value: area }),
      phone && fill(message.phone, { value: phone }),
      fileName ? message.fileSent && fill(message.fileSent, { file: fileName }) : message.fileLater,
    ].filter(Boolean);
    return `${chat}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [order.intro, message, business, qty, n, area, phone, fileName, tiers, chat]);

  const preview = order.preview;
  const previewTier = tierFor(tiers, n > 0 ? n : 0);

  return (
    <form
      className={`grid gap-6 ${preview ? "sm:grid-cols-[1fr_auto]" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        window.open(href, "_blank", "noopener");
      }}
    >
      <div className="grid gap-4">
        <label className="cs-field">
          <span>{fields.business.label}</span>
          <input className="cs-input" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder={fields.business.placeholder} maxLength={40} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="cs-field">
            <span>{fields.quantity.label}</span>
            <input className="cs-input" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} placeholder={fields.quantity.placeholder} />
          </label>
          <label className="cs-field">
            <span>{fields.phone.label}</span>
            <input className="cs-input" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={fields.phone.placeholder} />
          </label>
        </div>
        <label className="cs-field">
          <span>{fields.area.label}</span>
          <input className="cs-input" value={area} onChange={(e) => setArea(e.target.value)} placeholder={fields.area.placeholder} />
        </label>
        {fields.file && (
          <label className="cs-field">
            <span>{fields.file.label}</span>
            <span className="cs-file relative">
              <input type="file" accept="image/*,.pdf" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
              <b>{fields.file.button ?? "Choose file"}</b>
              <span className="truncate">{fileName || fields.file.placeholder}</span>
            </span>
          </label>
        )}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
          <button type="submit" className="cs-btn cs-btn-brand">
            <WhatsAppGlyph />
            {order.submit}
          </button>
          {order.fine && <p className="cs-fine">{order.fine}</p>}
        </div>
      </div>
      {preview && (
        <aside className="cs-preview sm:w-[180px]">
          {preview.heading && <small>{preview.heading}</small>}
          <Bottle id="order-preview" label={{ ...preview.label, name: business.trim() || preview.placeholderName }} height={240} />
          {previewTier && (
            <div className="text-center">
              <div className="cs-num text-3xl text-white">{previewTier.price}</div>
              {previewTier.previewNote && <div className="text-xs font-semibold opacity-80">{previewTier.previewNote}</div>}
            </div>
          )}
        </aside>
      )}
    </form>
  );
}
