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

import { listDesignSystems } from "@/app/actions/studio/systems/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DesignSystemsPage() {
  const systems = await listDesignSystems();
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Design systems</h1>
        <Link href="/studio/systems/new" className="text-sm underline">
          New design system
        </Link>
      </div>
      {systems.length === 0 ? (
        <p className="text-muted-foreground">No design systems yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {systems.map((s) => (
            <Link key={s.name} href={`/studio/systems/${encodeURIComponent(s.name)}`}>
              <Card className="hover:border-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">{s.system_name || s.name}</CardTitle>
                  {s.is_default ? <Badge>Default</Badge> : null}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
