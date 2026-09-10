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

// agent_sdk 1.17.0: the logos marquee's track rule. Run by
// tests/test_manifest.py against a staged copy of
// components/custom/landing/agent-logos.ts.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  LOGOS_LANE_MIN,
  LOGOS_TRACK_LANES,
  logosLaneRepeats,
  logosTrack,
} from './agent-logos.ts';

describe('logosTrack: the lane repeated three times', () => {
  it('three lanes, because the marquee keyframes shift the track by a third', () => {
    assert.equal(LOGOS_TRACK_LANES, 3);
    assert.equal(LOGOS_LANE_MIN, 8);
  });

  it('a two-site network fills a lane of eight and a track of twenty-four, in list order', () => {
    const track = logosTrack(['supacharge', 'juvo']);
    assert.equal(logosLaneRepeats(2), 4);
    assert.equal(track.length, 24);
    assert.deepEqual(track.slice(0, 4), ['supacharge', 'juvo', 'supacharge', 'juvo']);
    // Each lane is the same, so the -33.33% shift lands on an identical frame.
    assert.deepEqual(track.slice(0, 8), track.slice(8, 16));
    assert.deepEqual(track.slice(8, 16), track.slice(16, 24));
  });

  it('a lane already eight long repeats once; a longer list is not cut', () => {
    const eight = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    assert.equal(logosLaneRepeats(8), 1);
    assert.equal(logosTrack(eight).length, 24);
    assert.equal(logosLaneRepeats(9), 1);
    assert.equal(logosTrack([...eight, 'i']).length, 27);
  });

  it('an empty list is an empty track: the section draws nothing', () => {
    assert.equal(logosLaneRepeats(0), 0);
    assert.deepEqual(logosTrack([]), []);
  });
});
