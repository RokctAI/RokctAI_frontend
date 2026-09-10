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

/**
 * The shell's theme seam, shipped by base_sdk since 1.22.0.
 *
 * Ray, 2026-09-09: "default to dark mode". Until now every shell carried its
 * own copy of this file (a bare pass-through for next-themes' props) and its
 * root layout chose the default on its own, which is how one shell came to
 * open dark and the other to follow the visitor's OS. The rule now lives
 * here, once, for every shell the composer lands it on:
 *
 * - `defaultTheme` is DARK. A first visit with NO stored preference paints
 *   dark whatever the OS says. A preference the visitor already expressed
 *   through the header's toggle (next-themes keeps it under the `theme`
 *   key in localStorage) is honoured exactly as before, and the toggle keeps
 *   flipping between light and dark.
 * - `attribute` is "class", the signal Tailwind's `darkMode: ["class"]`
 *   reads, so the `dark:` variants across the composed pages stay live.
 * - Everything else (`enableSystem`, `disableTransitionOnChange`, `storageKey`
 *   and the rest) is next-themes' own default unless the host passes it.
 *   With `enableSystem` on, "system" remains a value a toggle may select;
 *   it is only no longer what an unexpressed preference resolves to.
 *
 * A host layout may still pass `defaultTheme`, but the platform rule is dark
 * and a layout that passes "light" or "system" is overriding it (the
 * manifest's app/layout.tsx note states the contract). The props type comes
 * from the "next-themes" package root: next-themes 0.4.x ships no
 * `dist/types` entry point.
 */
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import * as React from "react";

/** The theme an unexpressed preference resolves to on every shell. */
export const DEFAULT_THEME = "dark";

/** Where next-themes writes the theme: the `dark` class on <html>. */
export const THEME_ATTRIBUTE = "class";

export function ThemeProvider({
  children,
  attribute = THEME_ATTRIBUTE,
  defaultTheme = DEFAULT_THEME,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export default ThemeProvider;
