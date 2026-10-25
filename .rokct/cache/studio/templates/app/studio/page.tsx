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


import Link from "next/link";

import { listRequests } from "@/app/actions/studio/requests/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const SECTIONS = [
  { href: "/studio/requests/new", label: "New design" },
  { href: "/studio/check", label: "Check artwork" },
  { href: "/studio/systems", label: "Design systems" },
  { href: "/studio/campaigns", label: "Campaigns" },
  { href: "/studio/documents", label: "Documents" },
  { href: "/studio/print", label: "Print jobs" },
  { href: "/studio/preflight", label: "Client PDF preflight" },
  { href: "/studio/settings/hot-folder", label: "Hot folder" },
];

export default async function StudioHomePage() {
  const requests = await listRequests();
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Studio</h1>
      <nav className="flex flex-wrap gap-3 text-sm">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="rounded-md border px-3 py-1.5 hover:border-primary">
            {s.label}
          </Link>
        ))}
      </nav>
      <h2 className="text-lg font-medium">Design requests</h2>
      {requests.length === 0 ? (
        <p className="text-muted-foreground">No design requests yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {requests.map((r) => (
            <Link key={r.name} href={`/studio/requests/${encodeURIComponent(r.name)}`}>
              <Card className="hover:border-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">{r.title || r.name}</CardTitle>
                  <Badge variant="outline">{r.status}</Badge>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <div>{[r.format, r.source_mode].filter(Boolean).join(" · ")}</div>
                  <div>{[r.customer, r.design_system].filter(Boolean).join(" · ")}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
