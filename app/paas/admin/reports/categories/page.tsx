"use client";

import GenericReport from "@/components/admin/GenericReport";

export default function CategoriesReportPage() {
    return (
        <GenericReport
            title="Categories Report"
            reportType="Category"
            columns={[
                { key: "name", label: "Category" },
                { key: "products_count", label: "Total Products" },
                { key: "sales_count", label: "Total Sales" }
            ]}
        />
    );
}
