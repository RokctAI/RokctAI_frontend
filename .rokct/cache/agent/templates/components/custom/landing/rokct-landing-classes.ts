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

// The class names rokct.ai's landing root carries (1.24.0): the one class
// every rokct-landing.css rule is scoped to, and the three font variables
// of ./rokct-fonts.ts. rokct-hero.tsx hands RK_ROOT_CLASS to base_sdk's
// landing host as `meta.rootClass`, so the root that wraps the header, the
// hero and every section carries them in the first HTML.

import { rkDisplay, rkMono, rkSans } from "./rokct-fonts";

/** The class every rokct-landing.css rule is scoped to. */
export const RK_THEME_CLASS = "rk-landing";

/** The token class and the three font variables, in one list. */
export const RK_THEME_CLASSES: readonly string[] = [
  RK_THEME_CLASS,
  rkDisplay.variable,
  rkSans.variable,
  rkMono.variable,
];

/** RK_THEME_CLASSES as `PageSectionMeta.rootClass` wants it: space-separated. */
export const RK_ROOT_CLASS = RK_THEME_CLASSES.join(" ");
