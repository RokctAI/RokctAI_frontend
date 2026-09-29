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


// agent_sdk 1.21.0: the list of opportunity links shared by the
// /opportunities page and the "still open" list under a closed opportunity.

import Link from "next/link";

import { KIND_LABEL, opportunityHref, type OpportunitySummary } from "@/lib/agent-opportunity-cards";

export function OpportunityList({ items }: { items: OpportunitySummary[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-4 divide-y rounded-lg border">
      {items.map((item) => (
        <li key={`${item.kind}/${item.slug}`}>
          <Link
            href={opportunityHref(item.kind, item.slug)}
            className="flex flex-col gap-1 px-4 py-3 hover:bg-muted sm:flex-row sm:items-center sm:justify-between"
          >
            <span>
              <span className="font-medium">{item.title}</span>
              {item.organization && (
                <span className="block text-sm text-muted-foreground">{item.organization}</span>
              )}
            </span>
            <span className="shrink-0 text-sm text-muted-foreground">
              {item.deadline ? `Closes ${item.deadline}` : KIND_LABEL[item.kind]}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
