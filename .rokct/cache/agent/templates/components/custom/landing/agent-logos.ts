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
// The pure half of rokct.ai's logos marquee (components/custom/logos.tsx):
// how the network sites base resolved become the marquee track. Kept
// import-free so tests/test_manifest.py can execute it under node beside
// agent-network-strip.ts.
//
// The marquee keyframes (the host's tailwind.config.ts: translateX(0%) ->
// translateX(-33.33%), linear, infinite) shift the track by one third, so
// the track is the SAME lane three times and the loop is seamless. The
// old section had eight logos in a lane; the network has two or three
// sites, so a lane repeats the list until it is at least LOGOS_LANE_MIN
// long, or a wide viewport would show the track's end.

/** A lane is at least this many items: the list repeats to reach it. */
export const LOGOS_LANE_MIN = 8;

/** The lane is rendered this many times; the keyframes shift by 1/3. */
export const LOGOS_TRACK_LANES = 3;

/** How many times the list repeats inside one lane. */
export function logosLaneRepeats(count: number): number {
  if (count <= 0) return 0;
  return Math.max(1, Math.ceil(LOGOS_LANE_MIN / count));
}

/**
 * The marquee track for `sites`: one lane (the list repeated
 * [logosLaneRepeats] times) rendered [LOGOS_TRACK_LANES] times, in list
 * order. Empty for an empty list - the section then draws nothing.
 */
export function logosTrack<T>(sites: readonly T[]): T[] {
  const repeats = logosLaneRepeats(sites.length);
  const lane: T[] = [];
  for (let i = 0; i < repeats; i += 1) lane.push(...sites);
  const track: T[] = [];
  for (let i = 0; i < LOGOS_TRACK_LANES; i += 1) track.push(...lane);
  return track;
}
