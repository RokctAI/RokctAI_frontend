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

import { getShopFloorItems } from "@/app/actions/handson/all/accounting/manufacturing/shop_floor";
import { ShopFloorList } from "@/components/handson/shop-floor-components";
import { TableRow, TableCell } from "@/components/ui/table";

export const dynamic = "force-dynamic";
export default async function Page() {
  const data = await getShopFloorItems("Downtime Entry");
  return (
    <div className="p-6">
      <ShopFloorList
        title="Downtime Entries"
        items={data}
        newItemUrl="/handson/all/supply_chain/manufacturing/shop-floor/downtime/new"
        headers={["Station", "Reason", "From", "To"]}
        renderRow={(item: any) => (
          <TableRow key={item.name}>
            <TableCell>{item.workstation}</TableCell>
            <TableCell>{item.stop_reason}</TableCell>
            <TableCell>{item.from_time}</TableCell>
            <TableCell>{item.to_time}</TableCell>
          </TableRow>
        )}
      />
    </div>
  );
}
