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

import { getStockLedgerEntries } from "@/app/actions/handson/all/accounting/inventory/stock";
import { SimpleList } from "@/components/handson/stock-advanced-components";
import { TableRow, TableCell } from "@/components/ui/table";
export const dynamic = "force-dynamic";
export default async function Page() {
  const data = await getStockLedgerEntries();
  return (
    <div className="p-6">
      <SimpleList
        title="Stock Ledger"
        items={data}
        headers={["Item", "Qty", "Rate", "Voucher"]}
        renderRow={(i: any) => (
          <TableRow key={i.name}>
            <TableCell>{i.item_code}</TableCell>
            <TableCell>{i.actual_qty}</TableCell>
            <TableCell>{i.valuation_rate}</TableCell>
            <TableCell>
              {i.voucher_type} - {i.voucher_no}
            </TableCell>
          </TableRow>
        )}
      />
    </div>
  );
}
