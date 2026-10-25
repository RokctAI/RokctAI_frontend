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

/** Engine-generated SVG, sandboxed: no scripts run in the preview. */
export function SvgPreview({ svg, className }: { svg: string; className?: string }) {
  return (
    <iframe
      title="Preview"
      sandbox=""
      className={className ?? "h-64 w-full rounded-md border bg-white"}
      srcDoc={`<html><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh">${svg.replace("<svg", '<svg style="max-width:100%;max-height:100%"')}</body></html>`}
    />
  );
}
