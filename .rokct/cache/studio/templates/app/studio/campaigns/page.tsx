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

import { listCampaigns } from "@/app/actions/studio/campaigns/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const campaigns = await listCampaigns();
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Campaigns</h1>
        <Link href="/studio/campaigns/new" className="text-sm underline">
          New campaign
        </Link>
      </div>
      {campaigns.length === 0 ? (
        <p className="text-muted-foreground">No campaigns yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((c) => (
            <Link key={c.name} href={`/studio/campaigns/${encodeURIComponent(c.name)}`}>
              <Card className="hover:border-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">{c.title || c.name}</CardTitle>
                  <Badge variant="outline">{c.status}</Badge>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {[c.customer, c.design_system].filter(Boolean).join(" · ")}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
