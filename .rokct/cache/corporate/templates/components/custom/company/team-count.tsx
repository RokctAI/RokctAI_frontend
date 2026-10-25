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

// The count beside the /team title (corporate_sdk 1.3.0; Ray, 2026-10-03:
// "Team [45]", the number in a rectangle). The number is what the page
// actually draws: the data/team.json members this SDK renders (`members`,
// counted on the server) plus every home-SDK section on the page that
// declares how many cards it draws with a `data-team-count` attribute on
// its own wrapper. This SDK imports no home SDK: the section states its
// number, the title sums it. A section that states nothing adds nothing.
// The badge is neutral here (`data-team-count-badge`); a home SDK's theme
// may style it. Hidden while the sum is 0.

import React, { useEffect, useRef, useState } from "react";

export function sumTeamCounts(values: readonly (string | null | undefined)[]): number {
  return values.reduce((sum, value) => {
    const n = Number.parseInt(value ?? "", 10);
    return Number.isFinite(n) && n > 0 ? sum + n : sum;
  }, 0);
}

export function TeamCount({ members }: { members: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(members);

  useEffect(() => {
    const page = ref.current?.closest("[data-team-page]");
    if (!page) return;
    const read = () =>
      setCount(
        members +
          sumTeamCounts(
            Array.from(page.querySelectorAll("[data-team-count]")).map((el) =>
              el.getAttribute("data-team-count"),
            ),
          ),
      );
    read();
    const observer = new MutationObserver(read);
    observer.observe(page, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-team-count"] });
    return () => observer.disconnect();
  }, [members]);

  return (
    <span
      ref={ref}
      data-team-count-badge={count}
      aria-label={`${count} people`}
      hidden={count === 0}
      className="ml-3 inline-flex items-center rounded-md border border-current px-2 py-0.5 align-middle text-base font-semibold tabular-nums"
    >
      {count}
    </span>
  );
}

export default TeamCount;
