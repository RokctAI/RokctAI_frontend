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

import { useEffect, useState } from "react";

import { listDesignSystems, listFormats } from "@/app/actions/studio/systems/actions";
import type { Format } from "@/app/actions/studio/systems/types";

/** Design system + format pickers shared by the studio forms. */
export function SystemFormatFields({
  system,
  onSystem,
  format,
  onFormat,
  allowNoFormat = false,
}: {
  system: string;
  onSystem: (v: string) => void;
  format?: string;
  onFormat?: (v: string) => void;
  allowNoFormat?: boolean;
}) {
  const [systems, setSystems] = useState<any[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  useEffect(() => {
    listDesignSystems().then(setSystems);
    if (onFormat) listFormats().then(setFormats);
  }, [onFormat]);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-1 text-sm">
        <span>Design system</span>
        <select className="w-full rounded-md border p-2" value={system} onChange={(e) => onSystem(e.target.value)}>
          <option value="">Default</option>
          {systems.map((s) => (
            <option key={s.name} value={s.name}>
              {s.system_name || s.name}
            </option>
          ))}
        </select>
      </label>
      {onFormat && (
        <label className="space-y-1 text-sm">
          <span>Format</span>
          <select className="w-full rounded-md border p-2" value={format} onChange={(e) => onFormat(e.target.value)}>
            {allowNoFormat && <option value="">Keep as is</option>}
            {formats.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name} ({f.width}×{f.height})
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
