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

// The Sticks drawings (agent_sdk 1.25.0), as the approved concept draws
// them: the logo mark, the ball-head portraits on the role cards, the feed,
// the shifts strip and the ask, and the crowd picture in the hero and the
// closing band. Server-safe and directive-free.
//
// The portraits are the concept's: a white ball head with an ink outline,
// ink eyes and mouth, a soft grey shine, and each Stick's hair - ink for
// most, Tumi's green cap - the same in both themes, as the concept keeps
// them. Heads only and no props, so a role is never told by an object.
//
// The crowd is the concept's own picture (public/sticks/crowd-light.webp
// and crowd-dark.webp): Sticks in coloured shirts, one of them smiling up
// at you. Ray called it "the best design"; the page swaps the light and
// dark copies with the theme and fades the edge to the page in CSS.

import type { StickKey } from "./sticks-landing-config";

const INK = "#1B1916";
const FACE = "#FFFFFF";
const SHINE = "#BDB8B0";

/** The Sticks mark: a ball head with a smile, the one who looks up. */
export function SticksMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="17.5" fill={FACE} stroke="currentColor" strokeWidth="3" />
      <circle cx="14.5" cy="17" r="2.4" fill={INK} />
      <circle cx="25.5" cy="17" r="2.4" fill={INK} />
      <path d="M14.5 24.5q5.5 4 11 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

type FrontHair = "cap" | "flat" | "bun" | "long" | "puffs";

/** Each Stick's hair and its colour, as the concept draws them. */
export const STICK_HAIR: Record<StickKey, { style: FrontHair; colour: string }> = {
  thandi: { style: "bun", colour: "#1E1A17" },
  tumi: { style: "cap", colour: "#4E8F3A" },
  kabelo: { style: "flat", colour: "#1E1A17" },
  naledi: { style: "long", colour: "#1E1A17" },
  lindiwe: { style: "puffs", colour: "#1E1A17" },
  sipho: { style: "cap", colour: "#1E1A17" },
};

function frontHair(style: FrontHair) {
  switch (style) {
    case "flat":
      return (
        <>
          <path d="M9 20a15 15 0 0 1 30 0l0 1q-15-4-30 0z" />
          <rect x="14" y="7" width="20" height="5" rx="2" />
        </>
      );
    case "bun":
      return (
        <>
          <circle cx="24" cy="6" r="4.5" />
          <path d="M8 23a16 16 0 0 1 32 0q-6-8-16-8t-16 8z" />
        </>
      );
    case "long":
      return <path d="M6 34V22a18 18 0 0 1 36 0v12h-4V24q-14-8-28 0v10z" />;
    case "puffs":
      return (
        <>
          <circle cx="10" cy="9" r="5" />
          <circle cx="38" cy="9" r="5" />
          <path d="M8 22a16 16 0 0 1 32 0q-16-6-32 0z" />
        </>
      );
    default:
      return <path d="M8 22a16 16 0 0 1 32 0q-16-7-32 0z" />;
  }
}

export type Mood = "calm" | "happy" | "sleep";

/** A ball-head portrait: face, hair, eyes and mouth. No body, no props. */
export function StickHead({ stick, size, mood = "calm" }: { stick: StickKey; size: number; mood?: Mood }) {
  const hair = STICK_HAIR[stick];
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className="head" aria-hidden="true" focusable="false">
      <circle cx="24" cy="25" r="16" fill={FACE} stroke={INK} strokeWidth="2.6" />
      <g fill={hair.colour}>{frontHair(hair.style)}</g>
      <circle cx="24" cy="25" r="16" fill="none" stroke={INK} strokeWidth="2.6" />
      {mood === "sleep" ? (
        <>
          <path d="M16 23q3 2 6 0M26 23q3 2 6 0" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M22 31h4" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="19" cy="24" r="2" fill={INK} />
          <circle cx="29" cy="24" r="2" fill={INK} />
          {mood === "happy" ? (
            <path d="M19 30q5 4 10 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M21 31h6" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          )}
        </>
      )}
      <path d="M34 31a11 11 0 0 1-4 4" fill="none" stroke={SHINE} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** The concept's crowd picture, served from the shell's public/sticks/. */
export const CROWD_PICTURE = {
  light: "/sticks/crowd-light.webp",
  dark: "/sticks/crowd-dark.webp",
  width: 1800,
  height: 1200,
} as const;

/** The crowd, light and dark copies; the theme class shows one (.l / .d in the CSS). */
export function CrowdPicture({ eager }: { eager?: boolean }) {
  const loading = eager ? "eager" : "lazy";
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="l"
        src={CROWD_PICTURE.light}
        alt=""
        width={CROWD_PICTURE.width}
        height={CROWD_PICTURE.height}
        loading={loading}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="d"
        src={CROWD_PICTURE.dark}
        alt=""
        width={CROWD_PICTURE.width}
        height={CROWD_PICTURE.height}
        loading={loading}
        decoding="async"
      />
    </>
  );
}
