export interface InvoiceItem {
    item_code: string;
    qty: number;
    rate: number;
}

export interface InvoiceData {
    customer: string;
    posting_date: string;
    due_date: string;
    items: InvoiceItem[];
    docstatus?: 0 | 1;
}
