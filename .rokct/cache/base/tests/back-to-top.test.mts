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

// base_sdk 1.42.0: the floating "Back to top" button's rules (Ray,
// 2026-09-11 12:32Z: "whats missing is floating push to home, that button
// you press and it get you to top i just forgot what it says"). Run by
// tests/test_manifest.py against a staged copy of
// components/custom/landing/back-to-top.ts under node's own test runner
// with type stripping: the threshold, the shown-or-hidden answer, the
// words and the scroll behaviour, with no DOM.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BACK_TO_TOP_LABEL,
  REDUCED_MOTION_MEDIA_QUERY,
  isPastThreshold,
  resolveThreshold,
  scrollBehaviour,
} from './back-to-top.ts';

describe('the words', () => {
  it('names the control the way the standard control is named', () => {
    assert.equal(BACK_TO_TOP_LABEL, 'Back to top');
  });

  it('asks the reduced-motion preference by its media query', () => {
    assert.equal(REDUCED_MOTION_MEDIA_QUERY, '(prefers-reduced-motion: reduce)');
  });
});

describe('resolveThreshold: the distance before the button shows', () => {
  it('is one viewport height when nothing is configured', () => {
    assert.equal(resolveThreshold(undefined, 900), 900);
    assert.equal(resolveThreshold(undefined, 640.5), 640.5);
  });

  it('is the configured distance when it is a finite, non-negative number', () => {
    assert.equal(resolveThreshold(300, 900), 300);
    assert.equal(resolveThreshold(0, 900), 0);
    assert.equal(resolveThreshold(1500, 0), 1500);
  });

  it('falls back to the viewport for a negative, NaN or infinite configuration', () => {
    assert.equal(resolveThreshold(-1, 900), 900);
    assert.equal(resolveThreshold(Number.NaN, 900), 900);
    assert.equal(resolveThreshold(Number.POSITIVE_INFINITY, 900), 900);
  });

  it('answers 0 for a viewport not yet measured, so any scroll shows the button', () => {
    assert.equal(resolveThreshold(undefined, 0), 0);
    assert.equal(resolveThreshold(undefined, -1), 0);
    assert.equal(resolveThreshold(undefined, Number.NaN), 0);
  });
});

describe('isPastThreshold: shown or hidden', () => {
  it('is hidden at the very top whatever the threshold', () => {
    assert.equal(isPastThreshold(0, 0), false);
    assert.equal(isPastThreshold(0, 900), false);
  });

  it('is hidden at the threshold and shown strictly past it', () => {
    assert.equal(isPastThreshold(900, 900), false);
    assert.equal(isPastThreshold(901, 900), true);
    assert.equal(isPastThreshold(1500, 900), true);
    assert.equal(isPastThreshold(1, 0), true);
  });

  it('is hidden for a scroll offset that was never measured', () => {
    assert.equal(isPastThreshold(Number.NaN, 0), false);
  });
});

describe('scrollBehaviour: the jump', () => {
  it('is smooth by default', () => {
    assert.equal(scrollBehaviour(false), 'smooth');
  });

  it('is the instant jump under reduced motion', () => {
    assert.equal(scrollBehaviour(true), 'auto');
  });
});
