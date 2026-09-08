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

import { getSalesPartners } from "@/app/actions/handson/all/accounting/selling/extras";
import { SimpleList } from "@/components/handson/commercial-extras-components";
import { TableRow, TableCell } from "@/components/ui/table";
export const dynamic = "force-dynamic";
export default async function Page() {
  const data = await getSalesPartners();
  return (
    <div className="p-6">
      <SimpleList
        title="Sales Partners"
        items={data}
        newItemUrl="/handson/all/commercial/selling/sales-partner/new"
        headers={["Name", "Commission %", "Type"]}
        renderRow={(i: any) => (
          <TableRow key={i.name}>
            <TableCell>{i.partner_name}</TableCell>
            <TableCell>{i.commission_rate}%</TableCell>
            <TableCell>{i.partner_type}</TableCell>
          </TableRow>
        )}
      />
    </div>
  );
}
