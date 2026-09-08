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

// Form registry for the generic landing hero (components/custom/hero.tsx).
//
// Ray, 2026-09-08: "no hero work same way as landing, they need to be
// injected like generic profile, chat box is for chat related stuff, i
// think if agent sdk is home it inject that chat". So the hero carries no
// input of its own: what sits between the headline and the trust line -
// rokctapp's chat box, a course search, a plain sign-up call to action -
// belongs to the home SDK, and it arrives here the way the landing sections
// (./page-sections.ts) and the hero copy (./hero-copy.ts) do. A home SDK
// installs a client component whose default export takes HeroFormProps and
// registers it with ONE line at the marker below through its manifest
// integrations:
//
//   { id: "<sdk>-<form>", load: () => import("@/components/custom/landing/<file>") },
//
// The hero renders the FIRST registered entry (one hero, one form) through
// a next/dynamic loader, so the form is server-rendered with the rest of
// the hero; with nothing registered the slot renders nothing, server and
// client alike, and a shell composed without a form-owning SDK shows the
// headline, trust line and badges alone. agent_sdk registers rokctapp's
// chat box here (the input, its typewriter placeholders and the sections
// registered in ./hero-sections.ts, which that box - not the hero - now
// consumes).
//
// Entries between the markers below are injected by the Rokct SDK installer
// (sdk_installer_base.py update_integrations()) - the same contract as
// ./hero-sections.ts, ./hero-copy.ts and ./page-sections.ts, and a separate
// file for the same reason those are: the installer anchors successive
// entries for a target file after the previous entry, whichever marker they
// named, so one file carries one marker and an entry is a single
// self-contained line with a dynamic import (no import statement of its
// own). Do not remove or reformat the marker comments inside the array
// literal.

import type { ComponentType } from "react";

import type {
  HeroConfig,
  HeroWord,
} from "@/components/custom/landing/hero-config";

/** What the hero hands the registered form. */
export type HeroFormProps = {
  /** The hero's resolved copy: HERO_CONFIG overlaid by the registered hero copy. */
  hero: HeroConfig;
  /** The landing host's sign-up URL, for a form whose submit sends the visitor there. */
  signupUrl: string;
  /** Report that the visitor is using the form; the hero collapses its wordmark while they are. */
  onFocusChange?: (focused: boolean) => void;
  /** Report that the form is showing results under itself; the hero stays collapsed and the page hides the sections below it. */
  onActiveChange?: (active: boolean) => void;
  /** Add words to the hero's headline rotation (a form whose sections carry copy of their own). */
  onHeadlineWordsChange?: (words: HeroWord[]) => void;
};

export type HeroFormComponent = ComponentType<HeroFormProps>;

/** The shape of a registered form's module. */
export type HeroFormModule = { default: HeroFormComponent };

export type HeroFormEntry = {
  /** Stable, unique across SDKs: "<sdk>-<form>". */
  id: string;
  load: () => Promise<HeroFormModule>;
};

export const HERO_FORM: HeroFormEntry[] = [
  // @rokct-sdk-hero-form-start
  // @rokct-sdk-hero-form-end
];

/**
 * Loads the first registered form's component. An entry that fails to load
 * is logged and skipped in favour of the next one; null when nothing is
 * registered or nothing loads, and the hero then renders no form at all.
 */
export async function loadHeroForm(): Promise<HeroFormComponent | null> {
  for (const entry of HERO_FORM) {
    try {
      return (await entry.load()).default;
    } catch (error) {
      console.error(`[hero] failed to load form "${entry.id}":`, error);
    }
  }
  return null;
}
