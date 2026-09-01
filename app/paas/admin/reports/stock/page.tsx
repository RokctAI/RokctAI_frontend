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

"use client";

import GenericReport from "@/components/admin/GenericReport";

export default function StockReportPage() {
  return (
    <GenericReport
      title="Stock Report"
      reportType="Product"
      columns={[
        { key: "name", label: "Product" },
        { key: "shop", label: "Shop" },
        { key: "stock", label: "Current Stock" },
        { key: "alert_quantity", label: "Low Stock Alert" },
      ]}
    />
  );
}
