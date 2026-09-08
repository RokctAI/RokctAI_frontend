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

import { getEmailCampaigns } from "@/app/actions/handson/all/crm/campaigns";

export default async function CampaignsPage() {
  const { data: campaigns } = await getEmailCampaigns();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Campaigns</h1>
          <p className="text-muted-foreground">
            Manage automated email sequences.
          </p>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <pre className="text-xs">{JSON.stringify(campaigns, null, 2)}</pre>
      </div>
    </div>
  );
}
