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

import t from "@/app/lib/i18n";
export default function ProductsReportPage() {
  return (
    <GenericReport
      title={t("products.products_report")}
      reportType="Product"
      columns={[
        { key: "name", label: "Product" },
        { key: "shop", label: "Shop" },
        {
          key: "price",
          label: "Price",
          format: (val) => `$${val?.toFixed(2)}`,
        },
        { key: "stock", label: "Stock" },
        { key: "sold", label: "Units Sold" },
      ]}
    />
  );
}
