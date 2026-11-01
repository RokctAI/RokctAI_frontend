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


// The client half of a local-data site's look: the root class and the two
// face variables on <html> while the page is up, for what only <html> can
// carry (the page background behind the frame, the scrollbar). The
// server already puts the same classes on the landing root (meta.rootClass).
"use client";

import { useEffect } from "react";

export function SiteThemeClasses({ classes }: { classes: readonly string[] }) {
  useEffect(() => {
    const root = document.documentElement;
    const added = classes.filter((name) => !root.classList.contains(name));
    added.forEach((name) => root.classList.add(name));
    return () => added.forEach((name) => root.classList.remove(name));
  }, [classes]);
  return null;
}
export default SiteThemeClasses;
