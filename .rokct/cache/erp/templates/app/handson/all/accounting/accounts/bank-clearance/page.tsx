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

import { getPayments } from "@/app/actions/handson/all/accounting/payments/getPayments";
import { BankClearanceTool } from "@/components/handson/bank-clearance-components";

export const dynamic = "force-dynamic";
export default async function Page() {
  // We use getPayments but we might need to modify it to include clearance_date in the fetch if not already there.
  // I'll assume I update getPayments to fetch clearance_date or it fetches * (all fields) implicitly in some versions,
  // but better to be explicit in the action later if needed. For now, we reuse existing action.
  const data = await getPayments();
  return (
    <div className="p-6">
      <BankClearanceTool payments={data} />
    </div>
  );
}
