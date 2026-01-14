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
                { key: "alert_quantity", label: "Low Stock Alert" }
            ]}
        />
    );
}
