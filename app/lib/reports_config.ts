export interface ReportConfig {
    name: string;
    title: string;
    ref_doctype: string;
}

export const LENDING_REPORTS: ReportConfig[] = [
    { name: "Loan Security Status", title: "Loan Security Status", ref_doctype: "Loan Security Pledge" },
    { name: "Loan Security Exposure", title: "Loan Security Exposure", ref_doctype: "Loan Security Pledge" },
    { name: "Loan Repayment and Closure", title: "Loan Repayment & Closure", ref_doctype: "Loan Repayment" },
    { name: "Loan Interest Report", title: "Loan Interest Report", ref_doctype: "Loan Interest Accrual" },
    { name: "Applicant-wise Loan Security Exposure", title: "Applicant Security Exposure", ref_doctype: "Loan Security Pledge" }
];
