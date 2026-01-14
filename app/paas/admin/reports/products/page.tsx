"use client";

import GenericReport from "@/components/admin/GenericReport";

export default function ProductsReportPage() {
    return (
        <GenericReport
            title="Products Report"
            reportType="Product"
            columns={[
                { key: "name", label: "Product" },
                { key: "shop", label: "Shop" },
                { key: "price", label: "Price", format: (val) => `$${val?.toFixed(2)}` },
                { key: "stock", label: "Stock" },
                { key: "sold", label: "Units Sold" }
            ]}
        />
    );
}
