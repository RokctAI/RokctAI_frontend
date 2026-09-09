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

// The landing page's floating section nav: one tick per section, the
// active one widened, scrolling to the section on click. The entries come
// from the page (base_sdk's landing-content.tsx builds them from its config
// and the registered sections), so this file names no section of its own.
// An entry that carries base_sdk's optional `badge` ("new" / "soon") gets
// the little pill rokct.ai wears in its header menu - since 1.8.0 the SAME
// component, base_sdk >= 1.14.0's components/custom/menu-label.tsx
// (bg-primary with black text, Ray, 2026-09-09: "use primary color and
// text in black"), so the nav and the header cannot show two different
// pills. It paints the shell's own `primary` token rather than a fixed
// colour: rokct's accent is yellow, Supacharge's (lms_sdk's copy of this
// nav) is orange.

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import type { LandingNavItem } from "@/components/custom/landing/landing-config";
import { MenuLabel } from "@/components/custom/menu-label";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

export function FloatingNav({ items }: { items: LandingNavItem[] }) {
  const [activeSection, setActiveSection] = useState<string>(
    items[0]?.id ?? "",
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { root: null, rootMargin: "-20% 0px -20% 0px", threshold: 0.1 },
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-1.5 items-start">
      {items.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className="group relative flex items-center py-1.5 px-2"
            aria-label={`Scroll to ${item.label}${item.badge ? ` (${item.badge})` : ""}`}
          >
            <motion.div
              animate={{ width: isActive ? 32 : 16 }}
              className={`h-[2px] rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-zinc-900 dark:bg-white opacity-100"
                  : "bg-zinc-400 dark:bg-zinc-500 opacity-50 group-hover:opacity-100 group-hover:w-[24px]"
              }`}
            />
            <span className="absolute left-full ml-4 inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">
              {item.label}
              {item.badge ? (
                <MenuLabel badge={item.badge} />
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * What this section adds to base_sdk's landing host when registered in
 * components/custom/landing/page-sections.ts: a negative order, so the
 * page renders it before the hero as a fixed overlay that stays visible
 * while the hero shows search results, as the shell did. Not a nav stop.
 */
export const meta: PageSectionMeta = { order: -1, nav: [] };

/** The registered form: the page hands the whole nav in as `nav`. */
export default function FloatingNavSection({ nav }: PageSectionProps) {
  return <FloatingNav items={nav} />;
}
