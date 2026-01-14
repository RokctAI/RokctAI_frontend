"use client";

import GenericReport from "@/components/admin/GenericReport";

export default function OverviewReportPage() {
    return (
        <GenericReport
            title="Overview Report"
            reportType="Overview"
            columns={[
                { key: "metric", label: "Metric" },
                { key: "value", label: "Value" },
                { key: "change", label: "Change (%)", format: (val) => `${val > 0 ? '+' : ''}${val}%` }
            ]}
        />
    );
}
