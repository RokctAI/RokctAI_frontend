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

// The legal document renderer (corporate_sdk 1.0.0): the title and the
// body, the body as the text it is, whitespace kept, at prose width - the
// way rokct.ai's hand-rolled /legal/[id] page renders a "Terms and
// Conditions" document. Server-safe on purpose: no "use client", no hooks,
// no browser APIs, so app/legal/[id]/page.tsx renders it on the server
// and the first HTML carries the words.
//
// Shell-agnostic: no product name, no company, no brand colour. Every
// value arrives as the document; the only classes are neutral.

import React from "react";

/** One legal document as the page renders it. */
export interface LegalDoc {
  /** The doc name - the `/legal/<name>` route id. */
  name: string;
  title: string;
  /** The body, as text (the doctype's `terms` field). */
  body: string;
  disabled: boolean;
}

/**
 * The row a gateway read answered, as a [LegalDoc] - or `null` when it is
 * not one (no row, no string name or title). The body may be empty; the
 * `disabled` flag (Frappe's 0/1) is a boolean the page decides on.
 */
export function normaliseLegalDoc(row: unknown): LegalDoc | null {
  const raw = (row ?? null) as Record<string, unknown> | null;
  const doc =
    raw && typeof raw === "object" && raw.message && typeof raw.message === "object"
      ? (raw.message as Record<string, unknown>)
      : raw;
  if (!doc || typeof doc !== "object") return null;
  const name = typeof doc.name === "string" ? doc.name.trim() : "";
  const title = typeof doc.title === "string" ? doc.title.trim() : "";
  if (!name || !title) return null;
  const body = typeof doc.terms === "string" ? doc.terms : "";
  const disabled = doc.disabled === true || Number(doc.disabled) === 1;
  return { name, title, body, disabled };
}

export interface LegalDocProps {
  doc: LegalDoc;
  className?: string;
}

/** The document: an article with its title and its body, whitespace kept. */
export function LegalDocView({ doc, className = "" }: LegalDocProps) {
  return (
    <article
      className={`mx-auto w-full max-w-3xl px-4 py-12 ${className}`}
      data-legal-doc={doc.name}
    >
      <header className="mb-8 border-b border-black/10 dark:border-white/10 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">{doc.title}</h1>
      </header>
      <div className="whitespace-pre-wrap break-words text-base leading-relaxed opacity-80">
        {doc.body}
      </div>
    </article>
  );
}

export default LegalDocView;
