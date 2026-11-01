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

/**
 * The shell's theme seam, shipped by base_sdk since 1.22.0: the one
 * component every host layout wraps its page in (the manifest's
 * app/layout.tsx note states the contract). Since 1.35.0 it is a SERVER
 * component - no "use client" - so that it can read the shell's data/
 * folder on the server: it renders, first, the colour block a
 * data/theme.json declares (./site-theme.tsx, `:root { --primary ... }`
 * from lib/site-data/read-site-data.ts; nothing at all for a shell with no
 * theme file or in backend mode) and then the client provider
 * (./theme-provider.client.tsx) that holds the 1.22.0 rule: next-themes
 * with `defaultTheme` dark and `attribute` "class". The same split as a
 * landing section's entry and its <name>.client.tsx: the entry is
 * directive-free and the hooks live beside it. Every prop a layout passed
 * before (`attribute`, `defaultTheme`, `enableSystem`,
 * `disableTransitionOnChange`, ...) is data and passes through unchanged;
 * a layout that passes "light" or "system" as `defaultTheme` still
 * overrides the platform rule and is still a host regression.
 *
 * Since 1.56.0 (Ray, 2026-10-31: "every app shell need the button to go
 * up") the seam also mounts the floating "Back to top" button
 * (./back-to-top.tsx) with `scope="root"`, after the page, so every route
 * of every shell has it with no layout edit. It steps aside wherever a
 * framed button already serves the page (the landing shell, the site
 * frame, a home SDK's own page root), which wears that page's own look.
 * The seam also resolves the site's button config once
 * (./site-back-to-top.ts: base's fallback, the home SDK's registered
 * style, data/theme.json `backToTop`) and hands it to every button on the
 * page through <BackToTopProvider>, so the root and framed copies read the
 * same config. That makes the seam an async server component.
 */

// ==========================================
// [GENERATED TEMPLATE FILE]
// This file was installed from: base_sdk
// Feel free to modify and customize this code.
// Note: If you edit this file, the SDK installer will detect your changes
// and automatically skip overwriting it during future upgrades.
// ==========================================

import type { ThemeProviderProps } from "next-themes";
import * as React from "react";

import { BackToTop, BackToTopProvider } from "@/components/custom/back-to-top";
import { loadSiteBackToTop } from "@/components/custom/site-back-to-top";
import { SiteTheme } from "@/components/custom/site-theme";
import {
  DEFAULT_THEME,
  THEME_ATTRIBUTE,
  ThemeProviderClient,
} from "@/components/custom/theme-provider.client";

export { DEFAULT_THEME, THEME_ATTRIBUTE };

export async function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  const backToTop = await loadSiteBackToTop();
  return (
    <>
      <SiteTheme />
      <ThemeProviderClient {...props}>
        <BackToTopProvider value={backToTop}>
          {children}
          <BackToTop scope="root" />
        </BackToTopProvider>
      </ThemeProviderClient>
    </>
  );
}

export default ThemeProvider;
