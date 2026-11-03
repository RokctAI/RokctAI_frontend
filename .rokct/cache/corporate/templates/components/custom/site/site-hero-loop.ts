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

// corporate_sdk 1.7.0: the choreography of the local-data hero's loop, the
// approved three-size render's timeline as a pure function of time, so the
// server draws the first frame (the private-label scene) and the client
// only moves it. Stage coordinates are px on a 560 x 805 stage, bottles
// standing on the line y = FOOT. Scene A is the sizes (true relative
// scale), scene B the private-label hero.

export type LoopKey = "5l" | "15" | "05" | "pl";
export type LoopTag = "t05" | "t15" | "t5l" | "tpl";

/** px per viewBox unit of every drawn bottle on the stage. */
export const LOOP_UNIT = 0.6;
export const STAGE_W = 560;
export const STAGE_H = 805;
const FOOT = 700;

/** Per bottle: x of its centre, scale, rotation (deg), opacity. 1.7.0: Ray, "5l and 1.5l need a bit of space in between" - an 18 px gap. */
const A: Record<LoopKey, [number, number, number, number]> = { "5l": [126, 1, 0, 1], "15": [335, 1, 0, 1], "05": [467, 1, 0, 1], pl: [640, 1.2, -5, 0] };
const B: Record<LoopKey, [number, number, number, number]> = { "5l": [-240, 1, -8, 0], "15": [106, 1.2, 5, 1], "05": [720, 1, 8, 0], pl: [302, 1.36, -5, 1] };
const FB: Partial<Record<LoopKey, number>> = { "15": 670, pl: 682 };
const TAGS: Record<LoopTag, [number, number]> = { t05: [458, 268], t15: [321, 148], t5l: [0, 330], tpl: [300, 148] };

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number) => Math.min(1, Math.max(0, v));

export interface LoopGeo {
  /** Laid-out width of the bottle's box and the foot's height in it, px. */
  w: number;
  fh: number;
}

export interface LoopFrame {
  bottles: Record<LoopKey, { left: number; top: number; transform: string; opacity: number; level: number }>;
  tags: Record<LoopTag, { left: number; top: number; opacity: number; transform: string }>;
  /** The sizes copy (A) and the private-label copy (B). */
  panelA: { opacity: number; transform: string };
  panelB: { opacity: number; transform: string };
  floor: number;
}

/** Scene time: 0 is the sizes scene, 8 the private-label scene; 2.2 to 5.2 is the move between them. */
export function loopFrame(t: number, geo: Record<LoopKey, LoopGeo>): LoopFrame {
  const out = ease(clamp((t - 2.4) / 1.0));
  const mv = ease(clamp((t - 2.9) / 1.4));
  const join = ease(clamp((t - 3.5) / 1.3));
  const txt = clamp((t - 2.4) / 0.7);
  const txtIn = clamp((t - 3.2) / 0.8);
  const place = (k: LoopKey, x: number, scale: number, rot: number, op: number, ty = 0, foot = FOOT) => ({
    left: +(x - geo[k].w / 2).toFixed(2),
    top: +(foot - geo[k].fh).toFixed(2),
    transform: `translateY(${ty.toFixed(2)}px) rotate(${rot.toFixed(3)}deg) scale(${scale.toFixed(4)})`,
    opacity: +op.toFixed(3),
    level: +(-rot).toFixed(3),
  });
  const side = (k: "5l" | "05") => place(k, lerp(A[k][0], B[k][0], out), 1, lerp(A[k][2], B[k][2], out), 1 - out, 30 * out);
  const tag = (id: LoopTag, op: number, dy: number) => ({
    left: TAGS[id][0],
    top: TAGS[id][1],
    opacity: +clamp(op).toFixed(3),
    transform: `translateY(${dy.toFixed(2)}px)${id === "tpl" ? " rotate(3deg)" : ""}`,
  });
  const tplIn = clamp((t - 4.6) / 0.6);
  return {
    bottles: {
      "5l": side("5l"),
      "05": side("05"),
      "15": place("15", lerp(A["15"][0], B["15"][0], mv), lerp(1, B["15"][1], mv), lerp(0, B["15"][2], mv), 1, 0, lerp(FOOT, FB["15"]!, mv)),
      pl: place("pl", lerp(A.pl[0], B.pl[0], join), lerp(A.pl[1], B.pl[1], join), lerp(A.pl[2], B.pl[2], join), join, 0, lerp(FOOT, FB.pl!, join)),
    },
    tags: {
      t05: tag("t05", 1 - clamp((t - 2.2) / 0.5), 0),
      t5l: tag("t5l", 1 - clamp((t - 2.2) / 0.5), 0),
      t15: tag("t15", 1 - clamp((t - 2.4) / 0.5), 0),
      tpl: tag("tpl", tplIn, 10 * (1 - tplIn)),
    },
    panelA: { opacity: +(1 - txt).toFixed(3), transform: `translateY(${(-14 * txt).toFixed(2)}px)` },
    panelB: { opacity: +txtIn.toFixed(3), transform: `translateY(${(14 * (1 - txtIn)).toFixed(2)}px)` },
    floor: +(1 - mv).toFixed(3),
  };
}

/** The private-label scene (the first frame, and the reduced-motion hero). */
export const SCENE_PRIVATE_LABEL = 8;
export const SCENE_SIZES = 0;

/** The loop, in seconds: the private-label scene holds (long enough for its bottle to roll through its labels), moves to the sizes, they hold, and it moves back. */
export const LOOP_HOLD = 4;
export const LOOP_MOVE = 3;

export function loopPeriod(holdLabel: number, holdSizes = LOOP_HOLD): number {
  return holdLabel + holdSizes + 2 * LOOP_MOVE;
}

/** Scene time at loop time `u` (seconds since the loop began). */
export function loopSceneAt(u: number, holdLabel = LOOP_HOLD, holdSizes = LOOP_HOLD): number {
  const period = loopPeriod(holdLabel, holdSizes);
  const p = ((u % period) + period) % period;
  if (p < holdLabel) return SCENE_PRIVATE_LABEL;
  if (p < holdLabel + LOOP_MOVE) return 5.2 - (p - holdLabel);
  if (p < holdLabel + LOOP_MOVE + holdSizes) return SCENE_SIZES;
  return 2.2 + (p - holdLabel - LOOP_MOVE - holdSizes);
}
