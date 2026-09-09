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

// The ONE label a menu entry carries beside its word - the "NEW" on
// Partners, the "SOON" on a feature that is not out yet - for every menu
// base_sdk renders: the header's inline nav, its dropdown groups, its mobile
// panel, and any footer link row a shell or home SDK builds from the same
// nav entries.
//
// Ray, 2026-09-09: one shared component, "use primary color and text in
// black". So the pill is `bg-primary` (the shell's own token: rokct.ai's
// yellow, Supacharge's orange) with `text-black` - not text-primary-
// foreground, which a shell may set to white - so the label reads the same
// on every primary the platform has. The words come from the declared
// LandingNavBadge vocabulary ("new" | "soon"); this component uppercases
// them with CSS and adds nothing of its own.

import React from "react";

import type { LandingNavBadge } from "@/components/custom/landing/landing-config";
import { cn } from "@/lib/utils";

export interface MenuLabelProps {
  badge: LandingNavBadge;
  /** Extra classes, merged after the defaults. */
  className?: string;
}

export function MenuLabel({ badge, className }: MenuLabelProps) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full bg-primary text-black px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tighter leading-none",
        className,
      )}
    >
      {badge}
    </span>
  );
}

export default MenuLabel;
