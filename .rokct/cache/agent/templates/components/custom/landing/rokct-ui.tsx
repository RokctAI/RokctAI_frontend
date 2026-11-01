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

// The small pieces rokct.ai's landing sections share (1.24.0): the R mark,
// the question bubble every section opens with, the Remixicon glyphs the
// copy names by word, and the sample card the console and the module panes
// draw. No hooks and no "use client": the server-rendered section entries
// and their client halves both import it. Styling is rokct-landing.css,
// every class prefixed `rk-` and scoped to the landing root.

import React from "react";
import {
  RiBankCardLine,
  RiBox3Line,
  RiBuilding2Line,
  RiCalendarCheckLine,
  RiComputerLine,
  RiFileList3Line,
  RiGlobalLine,
  RiLineChartLine,
  RiLockLine,
  RiPhoneLine,
  RiSendPlane2Fill,
  RiShieldCheckLine,
  RiSmartphoneLine,
  RiStackLine,
  RiStore2Line,
  RiTeamLine,
  RiWhatsappLine,
  type RemixiconComponentType,
} from "@remixicon/react";

import type { RkCard, RkTone } from "./rokct-landing-content";

/** The R of rokct.ai's mark (public/images/logo.svg without the registered sign). */
export const RK_R_PATH =
  "M818 10c17,0 34,1 50,1l779 317c45,57 80,120 105,188l-62 706c-2,4 -4,7 -7,11 -73,111 -175,198 -306,260l257 375 -27 306 -418 0 -393 -575 -244 0 139 -1589 127 0zm-532 2164l-277 0 0 -2164 467 0 -190 2164z";

/** The mark's own box, so it scales without stretching. */
export const RK_R_VIEWBOX = "0 0 1760 2184";

export function RkMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox={RK_R_VIEWBOX} aria-hidden="true" focusable="false">
      <path d={RK_R_PATH} />
    </svg>
  );
}

/** The glyphs the copy names by word, all Remixicon. */
const ICONS: Record<string, RemixiconComponentType> = {
  bank: RiBankCardLine,
  team: RiTeamLine,
  chart: RiLineChartLine,
  box: RiBox3Line,
  store: RiStore2Line,
  phone: RiPhoneLine,
  building: RiBuilding2Line,
  global: RiGlobalLine,
  shield: RiShieldCheckLine,
  lock: RiLockLine,
  stack: RiStackLine,
  computer: RiComputerLine,
  smartphone: RiSmartphoneLine,
  whatsapp: RiWhatsappLine,
  send: RiSendPlane2Fill,
  file: RiFileList3Line,
  calendar: RiCalendarCheckLine,
};

export function RkIcon({ name, className = "rk-ico" }: { name: string; className?: string }) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} aria-hidden="true" />;
}

/** The question bubble a section opens with. */
export function RkAsk({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={["rk-ask", className].filter(Boolean).join(" ")}>
      <i aria-hidden="true">?</i>
      {children}
    </div>
  );
}

export function RkPill({ tone, children }: { tone: RkTone; children: React.ReactNode }) {
  return <span className={`rk-pill rk-pill-${tone}`}>{children}</span>;
}

/** A line of copy with **double-star** bold parts, as React nodes. */
export function rkBold(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <b key={i}>{part.slice(2, -2)}</b> : part,
  );
}

/** A heading's lines, broken where the copy breaks them. */
export function rkLines(lines: readonly string[]): React.ReactNode[] {
  return lines.flatMap((line, i) => (i === 0 ? [line] : [<br key={i} />, line]));
}

/** A sample card: header, rows (label, pill or stock bar, value) and its buttons. */
export function RkCardView({ card }: { card: RkCard }) {
  return (
    <div className="rk-card">
      <div className="rk-card-h">
        <span>{card.title}</span>
        {typeof card.meta === "string" ? (
          <span>{card.meta}</span>
        ) : card.meta ? (
          <RkPill tone={card.meta.tone}>{card.meta.text}</RkPill>
        ) : null}
      </div>
      {card.rows.map((row) => (
        <div className="rk-row" key={row.label}>
          <span>
            {row.label}
            {row.sub && <small>{row.sub}</small>}
          </span>
          {row.pill ? (
            <RkPill tone={row.pill.tone}>{row.pill.text}</RkPill>
          ) : row.bar !== undefined ? (
            <span className="rk-bar">
              <i style={{ width: `${row.bar}%` }} />
            </span>
          ) : (
            <span />
          )}
          {row.value ? <span className="rk-num">{row.value}</span> : <span />}
        </div>
      ))}
      {card.actions && card.actions.length > 0 && (
        <div className="rk-card-a">
          {card.actions.map((action) => (
            <span key={action.label} className={action.solid ? "rk-mini rk-mini-solid" : "rk-mini"}>
              {action.icon && <RkIcon name={action.icon} />}
              {action.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
