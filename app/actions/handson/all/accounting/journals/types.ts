export interface JournalEntryData {
    company: string;
    voucher_type: "Journal Entry" | "Opening Entry" | "Bank Entry" | "Cash Entry";
    posting_date: string;
    accounts: {
        account: string;
        debit_in_account_currency: number;
        credit_in_account_currency: number;
    }[];
}
