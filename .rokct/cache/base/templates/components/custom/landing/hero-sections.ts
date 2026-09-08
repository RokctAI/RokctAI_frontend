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

// Section registry for the generic landing hero (components/custom/hero.tsx).
//
// The registered form (./hero-form.ts - rokctapp's chat box, from
// agent_sdk) owns the input; a feature SDK owns what happens to a submitted
// query. Each registered section is rendered by that form under its input
// and receives the query through HeroSectionProps. A section's module may
// also export `meta` (HeroSectionMeta) to add headline words and input
// placeholders, so all of a feature's copy stays in the feature's own file.
//
// Entries between the markers below are injected by the Rokct SDK installer
// (sdk_installer_base.py update_integrations()) - the same contract as the
// nav marker in app/handson/sidebar-client.tsx and the flag marker in
// app/config/compose.ts. An installed SDK's manifest declares one line,
// inserted immediately after the start marker:
//
//   { id: "<sdk>-<section>", load: () => import("@/components/custom/landing/<file>") },
//
// The entry is a dynamic import on purpose: the installer injects lines at
// ONE marker per file (update_integrations() anchors successive entries
// for a target file after the previous entry, whichever marker they named),
// so a contribution must be a single self-contained line with no import
// statement of its own. It also means a section is only bundled when it is
// registered, and that a shell composed without the SDK never references
// the missing module. Do not remove or reformat the marker comments inside
// the array literal.

import type { ComponentType } from "react";

import type { HeroWord } from "@/components/custom/landing/hero-config";

/** What the hero hands every registered section. */
export interface HeroSectionProps {
  /** The submitted query; "" until the visitor submits, and again once they erase the input. */
  query: string;
  /** Increments on every submit so a section can re-run an unchanged query. */
  submitId: number;
  signupUrl: string;
  /** Report whether the section is showing something under the input; the hero collapses its chrome while any section is active. */
  onActiveChange: (active: boolean) => void;
  /** Report in-flight work; the hero shows a spinner on the submit button while any section is busy. */
  onBusyChange: (busy: boolean) => void;
  /** Ask the hero to clear the input and withdraw the query from every section. */
  onClear: () => void;
}

export type HeroSectionComponent = ComponentType<HeroSectionProps>;

/** Optional copy a section adds to the hero. */
export interface HeroSectionMeta {
  headlineWords?: HeroWord[];
  placeholders?: string[];
}

/** The shape of a registered section's module. */
export interface HeroSectionModule {
  default: HeroSectionComponent;
  meta?: HeroSectionMeta;
}

export interface HeroSectionEntry {
  /** Stable, unique across SDKs: "<sdk>-<section>". */
  id: string;
  load: () => Promise<HeroSectionModule>;
}

export const HERO_SECTIONS: HeroSectionEntry[] = [
  // @rokct-sdk-hero-sections-start
  // @rokct-sdk-hero-sections-end
];
