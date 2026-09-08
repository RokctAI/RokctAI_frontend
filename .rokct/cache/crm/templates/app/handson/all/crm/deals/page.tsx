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

import { Badge } from "@/components/ui/badge";
import { CreateDealDialog } from "@/components/handson/deals/create-deal-dialog";
import { getDocTypeMeta } from "@/app/actions/handson/all/crm/meta";
import { getDeals } from "@/app/actions/handson/all/crm/deals";
import { DealsClientView } from "@/components/handson/deals/deals-client-view";

export default async function DealsPage() {
  const [dealsRes, metaRes] = await Promise.all([
    getDeals(1, 50),
    getDocTypeMeta("Opportunity"),
  ]);
  const deals = dealsRes.data || [];
  const meta = metaRes;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">Manage your sales pipeline.</p>
        </div>
        <CreateDealDialog meta={meta.data!} />
      </div>

      <DealsClientView deals={deals} />
    </div>
  );
}
