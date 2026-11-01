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

// The flip card every shell shares (base_sdk 1.58.0). It is lms_sdk's
// LmsFlipCard - the Supacharge tutor and plan cards, the web counterpart of
// lms/dart's CardDeck flip - moved here unchanged in behaviour so other
// shells turn their cards the same way (Ray, 2026-10-31: the studio's
// portfolio card "flips ... exactly like the Supacharge tutor card").
// lms_sdk's landing/lms-flip-card.tsx now re-exports this file.
//
//   * Click (or Enter / Space on the focused card) turns it over; the
//     whole card is the target. Buttons and links inside call stopFlip so
//     they act on their own.
//   * On a device with a fine pointer that can hover, hovering also turns
//     it and leaving turns it back - unless a click pinned it. Touch
//     devices only get the tap. `hoverDelayMs` makes that hover-intent:
//     the pointer has to rest that long first (0, the tutor cards', turns
//     at once).
//   * prefers-reduced-motion: no rotation at all; the faces crossfade.
//   * The hidden face is `inert` and aria-hidden, so its links and buttons
//     leave the tab order and the accessibility tree until it shows.
//
// Two layouts. "fill" (the default, the tutor cards'): both faces are laid
// over the card, which the caller sizes. "stack": both faces share one grid
// cell, so the card is as tall as its taller face - for a card whose
// content sets its height (the studio portfolio).
//
// Colours are the caller's: `ringClassName` is the focus ring (lms_sdk
// passes the Supacharge primary), and nothing here names a colour.

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

/** Whether a media query matches, false on the server and until the first paint. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/** Stops a click inside a face's own control from also flipping the card. */
export const stopFlip = (event: React.SyntheticEvent) => event.stopPropagation();

/** How a turn came about: a click, tap or key press, or the pointer resting on it. */
export type FlipCause = "press" | "hover";

export interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  /** Accessible name of the flip control while the front shows. */
  flipLabel: string;
  /** Accessible name while the back shows. */
  flipBackLabel: string;
  /** Size and radius come from the caller. */
  className?: string;
  /** Extra classes on the flipping surface (a highlight ring, say). */
  surfaceClassName?: string;
  /** The focus ring's classes; the default is the shell's own ring token. */
  ringClassName?: string;
  /** "fill": faces laid over a card the caller sizes. "stack": the card is as tall as its taller face. */
  layout?: "fill" | "stack";
  /** Hover-intent: how long a fine pointer must rest before the card turns. */
  hoverDelayMs?: number;
  /** Controlled: the card's flipped state, when the caller wants to own it. */
  flipped?: boolean;
  onFlippedChange?: (flipped: boolean) => void;
  /** Every turn, by press or by hover, with what caused it. */
  onFlip?: (flipped: boolean, cause: FlipCause) => void;
  /** Test/automation hook: the wrapper's data attribute. */
  "data-card"?: string;
}

export const FLIP_DURATION_MS = 420;
export const FLIP_RING_CLASSES =
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function FlipCard({
  front,
  back,
  flipLabel,
  flipBackLabel,
  className = "",
  surfaceClassName = "",
  ringClassName = FLIP_RING_CLASSES,
  layout = "fill",
  hoverDelayMs = 0,
  flipped: controlled,
  onFlippedChange,
  onFlip,
  "data-card": dataCard,
}: FlipCardProps) {
  const [internal, setInternal] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const id = useId();

  useEffect(
    () => () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    },
    [],
  );

  const isControlled = controlled !== undefined;
  const flipped = isControlled ? controlled : internal || (canHover && hovered);

  const set = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternal(next);
      onFlippedChange?.(next);
      onFlip?.(next, "press");
    },
    [isControlled, onFlippedChange, onFlip],
  );

  const toggle = () => {
    const next = !flipped;
    set(next);
    // A click is a deliberate choice, so it outlives the hover.
    setPinned(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    } else if (event.key === "Escape" && flipped) {
      set(false);
      setPinned(false);
    }
  };

  const onMouseEnter = () => {
    const turn = () => {
      setHovered(true);
      if (canHover && !flipped) onFlip?.(true, "hover");
    };
    if (hoverDelayMs <= 0) {
      turn();
      return;
    }
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(turn, hoverDelayMs);
  };

  const onMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
    setHovered(false);
    if (!pinned && !isControlled) setInternal(false);
  };

  const stack = layout === "stack";
  const duration = `${FLIP_DURATION_MS}ms`;
  const surface: CSSProperties = {
    ...(stack ? { display: "grid" } : {}),
    ...(reducedMotion
      ? {}
      : {
          transformStyle: "preserve-3d",
          transition: `transform ${duration} cubic-bezier(0.4, 0, 0.2, 1)`,
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }),
  };
  const face = (isBack: boolean): CSSProperties => ({
    ...(stack ? { gridArea: "1 / 1", position: "relative" } : {}),
    ...(reducedMotion
      ? {
          transition: `opacity ${duration} ease`,
          opacity: (isBack ? flipped : !flipped) ? 1 : 0,
        }
      : {
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: isBack ? "rotateY(180deg)" : "rotateY(0deg)",
        }),
  });
  const faceClass = stack ? "min-w-0" : "absolute inset-0";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={flipped ? flipBackLabel : flipLabel}
      aria-describedby={`${id}-face`}
      data-card={dataCard}
      data-flipped={flipped ? "true" : "false"}
      onClick={toggle}
      onKeyDown={onKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group relative cursor-pointer select-none outline-none ${ringClassName} ${className}`}
      style={reducedMotion ? undefined : { perspective: "1400px" }}
    >
      <div className={`relative size-full ${surfaceClassName}`} style={surface}>
        <div
          id={`${id}-face`}
          className={faceClass}
          style={face(false)}
          aria-hidden={flipped}
          inert={flipped}
        >
          {front}
        </div>
        <div className={faceClass} style={face(true)} aria-hidden={!flipped} inert={!flipped}>
          {back}
        </div>
      </div>
    </div>
  );
}

export default FlipCard;
