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

// The platform section's tabs and panes (1.24.0), rendered by
// rokct-platform.tsx. Every pane is in the HTML; the selected one shows.

import React, { useState } from "react";
import { RiCheckLine } from "@remixicon/react";

import { RK_MODULES } from "@/components/custom/landing/rokct-landing-content";
import { RkCardView, RkIcon } from "@/components/custom/landing/rokct-ui";

export function RokctModules() {
  const [active, setActive] = useState(RK_MODULES[0]?.key ?? "");

  return (
    <div className="rk-mods rk-reveal">
      <div className="rk-tabs" role="tablist" aria-label="Modules">
        {RK_MODULES.map((mod) => (
          <button
            key={mod.key}
            type="button"
            role="tab"
            id={`rk-tab-${mod.key}`}
            aria-selected={mod.key === active}
            aria-controls={`rk-pane-${mod.key}`}
            className={mod.key === active ? "rk-tab rk-on" : "rk-tab"}
            onClick={() => setActive(mod.key)}
          >
            <span className="rk-ti">
              <RkIcon name={mod.icon} />
            </span>
            <span>
              <b>{mod.name}</b>
              <small>{mod.blurb}</small>
            </span>
          </button>
        ))}
      </div>
      <div>
        {RK_MODULES.map((mod) => (
          <div
            key={mod.key}
            id={`rk-pane-${mod.key}`}
            role="tabpanel"
            aria-labelledby={`rk-tab-${mod.key}`}
            className={mod.key === active ? "rk-pane rk-on" : "rk-pane"}
          >
            <div>
              <div className="rk-big">
                <q>{mod.quote}</q>
              </div>
              <ul>
                {mod.points.map((point) => (
                  <li key={point}>
                    <RiCheckLine className="rk-ico" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="rk-tags">
                {mod.tags.map((tag) => (
                  <span key={tag} className="rk-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="rk-viz">
              <div className="rk-msg rk-msg-me">{mod.ask}</div>
              {mod.reply && (
                <div className="rk-msg rk-msg-rok" style={{ fontSize: "14.5px" }}>
                  {mod.reply}
                </div>
              )}
              <RkCardView card={mod.card} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
