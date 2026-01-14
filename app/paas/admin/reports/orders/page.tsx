"use client";

import GenericReport from "@/components/admin/GenericReport";

export default function OrdersReportPage() {
    return (
        <GenericReport
            title="Orders Report"
            reportType="Order"
            columns={[
                { key: "name", label: "Order ID" },
                { key: "shop", label: "Shop" },
                { key: "grand_total", label: "Total", format: (val) => `$${val?.toFixed(2)}` },
                { key: "status", label: "Status" },
                { key: "creation", label: "Date", format: (val) => new Date(val).toLocaleDateString() }
            ]}
        />
    );
}
