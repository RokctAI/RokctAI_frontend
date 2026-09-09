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

// The landing page's header menu row: the section links a home SDK asked
// for, under the shell's own header.
//
// Generic chrome, not product content - the same split
// components/custom/footer-chrome.tsx makes. No product name, no brand
// colour and no copy of its own: every word arrives as a resolved
// [HeaderMenuItem] (see ./landing/header-menu.ts), and the only colours the
// markup names are neutral black/white alphas plus `currentColor`, so the
// row takes the ground and the ink of whatever header it sits under in both
// themes.
//
// It renders nothing at all for an empty list, so the host can mount it
// unconditionally without deciding anything.

import React from "react";
import Link from "next/link";

import type { HeaderMenuItem } from "@/components/custom/landing/header-menu";

/**
 * The badge beside a label, in the neutral treatment.
 *
 * rokctai_frontend's header paints its own badge yellow out of its theme
 * tokens and agent_sdk's floating nav paints its own; this row is the
 * generic one, so it states the flag without claiming a palette - the same
 * reason base_sdk declared `badge?: "new" | "soon"` as vocabulary and left
 * every nav to render it in its own tokens.
 */
function HeaderMenuBadge({ badge }: { badge: "new" | "soon" }) {
  return (
    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter leading-none shrink-0 bg-black/10 dark:bg-white/15">
      {badge}
    </span>
  );
}

export interface HeaderMenuRowProps {
  /** Already resolved against the page's live nav by [resolveHeaderMenuItems]. */
  items: HeaderMenuItem[];
  /** Extra classes on the row, for the spacing and divider a host wants. */
  className?: string;
  /** Accessible name for the row; the page has other navs on it. */
  ariaLabel?: string;
}

export function HeaderMenuRow({
  items,
  className = "",
  ariaLabel = "Sections",
}: HeaderMenuRowProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label={ariaLabel}
      className={`w-full border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur ${className}`}
    >
      {/* Scrolls sideways rather than wrapping: a menu is one line, and a
          narrow screen must not push the page's own content down. */}
      <div className="mx-auto flex max-w-6xl items-center gap-5 overflow-x-auto px-4 py-2.5 text-sm whitespace-nowrap">
        {items.map((item) =>
          item.external ? (
            <a
              key={item.key}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100"
            >
              {item.label}
              {item.badge && <HeaderMenuBadge badge={item.badge} />}
            </a>
          ) : (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100"
            >
              {item.label}
              {item.badge && <HeaderMenuBadge badge={item.badge} />}
            </Link>
          ),
        )}
      </div>
    </nav>
  );
}

export default HeaderMenuRow;
