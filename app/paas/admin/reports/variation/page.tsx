"use client";

import GenericReport from "@/components/admin/GenericReport";

export default function VariationReportPage() {
    return (
        <GenericReport
            title="Variation Report"
            reportType="Variation"
            columns={[
                { key: "product", label: "Product" },
                { key: "variation", label: "Variation" },
                { key: "sales", label: "Sales Count" },
                { key: "revenue", label: "Revenue", format: (val) => `$${val?.toFixed(2)}` }
            ]}
        />
    );
}
