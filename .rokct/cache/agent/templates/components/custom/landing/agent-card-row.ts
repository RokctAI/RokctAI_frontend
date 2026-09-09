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

// One row on a phone. Ray, 2026-09-09, on the same change having landed on
// supacharge.app first: "why rokctai didnt benefit from the change?"
//
// It did not because the sections are not shared. base_sdk holds only the
// landing HOST (components/custom/landing/page-sections.ts, the page, the
// orchestrator, the registry and the hero); every content section belongs
// to the home SDK, so Supacharge's cards and rokct.ai's cards are different
// components in different SDKs and lms_sdk 1.8.0 could not reach these.
//
// This is that change for rokct.ai's own sections: ONE definition a card
// grid adds to the grid it already has, not a special case written into
// each section. Add it, drop the `grid-cols-1` the grid no longer needs,
// and the section is a horizontally swipeable row below 640px and the grid
// it always was from 640px up.
//
// WHY THESE UTILITIES AND NOT A STYLESHEET. lms_sdk writes the same row as
// a `.sc-row` class because it already ships landing/lms-theme.css for
// Supacharge's own tokens. This SDK ships no CSS at all - every section
// here is Tailwind - so the row is Tailwind too, and it stays one shared
// string rather than becoming this SDK's first and only stylesheet plus an
// import seam to carry it.
//
// WHY THESE NUMBERS. They are the ones `pricing.tsx` already scrolls its
// plan cards with a section away (`flex overflow-x-auto flex-nowrap snap-x
// snap-mandatory` over `flex-none w-[85%] snap-center`): a card at 85% of
// the row so both neighbours show an edge, and centre snapping. A second
// scroller on the same page that sized or snapped differently would read as
// a different component rather than the same page. Two deliberate
// departures from it:
//   - the scrollbar is actually hidden here. `pricing.tsx` asks for that
//     with a `no-scrollbar` class that is not defined anywhere in this SDK
//     or the shell, so only its inline `scrollbarWidth` reaches Firefox and
//     webkit still draws base_sdk's yellow thumb (app/styles/
//     rokct-scroll.css) under the row. `[&::-webkit-scrollbar]:hidden` is
//     the rule that class is missing.
//   - no `scroll-snap-stop: always`. lms_sdk's row pins every swipe to one
//     card; `pricing.tsx` does not, and with ten feature cards a fling that
//     can cross several of them beats nine separate swipes.
//
// PHONES ONLY, AND MECHANICALLY SO: every utility below is behind `max-sm:`,
// so the whole row lives in one `@media not all and (min-width: 640px)`
// block and there is no declaration outside it to reach a larger screen. At
// 640px the section's own `sm:`/`md:`/`lg:`/`xl:` columns take back over and
// the layout is to the pixel what it was.
//
// THE ONE THING TO GET RIGHT WHEN ADDING IT: the grid must stop declaring a
// single column down here, or `grid-template-columns` fights the column
// flow. Drop `grid-cols-1`. If the grid's first column break is `md:`, that
// `grid-cols-1` was also holding the 640-767px band, so pin `sm:grid-cols-1`
// in its place; if it breaks at `sm:`, its own rule already owns that band
// and needs no pin.
export const AGENT_CARD_ROW = [
  // A grid, still - only flowing sideways, one column per card.
  "max-sm:grid-flow-col",
  "max-sm:auto-cols-[85%]",
  "max-sm:py-2",
  // The scroll is the browser's own: no JS, no dots, no arrows. The next
  // card's edge is the affordance, and a tap stays a tap.
  "max-sm:overflow-x-auto",
  "max-sm:overscroll-x-contain",
  "max-sm:snap-x",
  "max-sm:snap-mandatory",
  "max-sm:[-webkit-overflow-scrolling:touch]",
  // No scrollbar under the row, in all three engines.
  "max-sm:[scrollbar-width:none]",
  "max-sm:[-ms-overflow-style:none]",
  "max-sm:[&::-webkit-scrollbar]:hidden",
  // Each card: snaps centred, and free to be narrower than its content.
  "max-sm:[&>*]:min-w-0",
  "max-sm:[&>*]:snap-center",
].join(" ");
