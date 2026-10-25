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

import { getConstruction } from "@/app/actions/studio/prepress/actions";
import type { Construction } from "@/app/actions/studio/prepress/types";
import { Button } from "@/components/ui/button";

/**
 * Construction guides toggle for a candidate preview. Off by default;
 * when on, the overlay SVG replaces the preview and the notes list what
 * was found. Informational only: never blocks saving or approval.
 */
export function ConstructionPanel({
  candidate,
  children,
}: {
  candidate: string;
  children: React.ReactNode;
}) {
  const [on, setOn] = useState(false);
  const [data, setData] = useState<Construction | null>(null);

  async function toggle() {
    if (!on && !data) setData(await getConstruction(candidate));
    setOn(!on);
  }

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={toggle}>
        {on ? "Hide construction guides" : "Show construction guides"}
      </Button>
      {on && data ? (
        <>
          <iframe
            title="Construction guides"
            sandbox=""
            className="h-96 w-full rounded-md border bg-white"
            srcDoc={`<html><body style="margin:0">${data.overlay_svg.replace("<svg", '<svg style="width:100%;height:100%"')}</body></html>`}
          />
          <ul className="space-y-1 text-sm">
            {data.notes.map((n, i) => (
              <li key={i} className={n.startsWith("⚠") ? "text-amber-600" : "text-muted-foreground"}>
                {n}
              </li>
            ))}
          </ul>
        </>
      ) : (
        children
      )}
    </div>
  );
}
