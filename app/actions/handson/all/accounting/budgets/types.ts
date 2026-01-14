export interface BudgetData {
    budget_against: "Cost Center" | "Project";
    company: string;
    cost_center?: string;
    project?: string;
    fiscal_year: string;
    accounts: {
        account: string;
        budget_amount: number;
    }[];
}
