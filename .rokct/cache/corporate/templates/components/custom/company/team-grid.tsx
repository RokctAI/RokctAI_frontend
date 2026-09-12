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


// The team as a card grid (corporate_sdk 1.1.0): the members of the
// shell's `data/team.json` (base_sdk 1.35.0's `team` kind - name, role,
// an optional photo and optional links), one card each. A plain <img>
// for the photo: the path may be a public path or any origin, and the
// shell's next.config carries no image config to promise. A member with
// no photo gets initials. Server-safe, neutral classes, no brand.

import React from "react";

import type { SiteTeamMember } from "@/lib/site-data/kinds";

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function MemberCard({ member }: { member: SiteTeamMember }) {
  return (
    <li
      className="flex flex-col gap-3 rounded-2xl border border-black/10 p-5 dark:border-white/10"
      data-team-member={member.name}
    >
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-black/5 dark:bg-white/10">
        {member.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photo}
            alt={member.name}
            className="size-full object-cover object-top"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex size-full items-center justify-center text-4xl font-bold opacity-30"
          >
            {initialsOf(member.name)}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-lg font-semibold leading-tight">{member.name}</h2>
        <p className="text-sm opacity-70">{member.role}</p>
      </div>
      {member.links && member.links.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {member.links.map((link) => (
            <li key={`${link.label}:${link.href}`}>
              <a
                href={link.href}
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export interface TeamGridProps {
  members: readonly SiteTeamMember[];
  className?: string;
}

export function TeamGrid({ members, className = "" }: TeamGridProps) {
  if (members.length === 0) return null;
  return (
    <ul
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
      data-team-grid={members.length}
    >
      {members.map((member) => (
        <MemberCard key={`${member.name}:${member.role}`} member={member} />
      ))}
    </ul>
  );
}

export default TeamGrid;
