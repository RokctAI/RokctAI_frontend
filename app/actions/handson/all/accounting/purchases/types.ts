export interface PurchaseInvoiceData {
    supplier: string;
    posting_date: string;
    items: {
        item_code: string;
        qty: number;
        rate: number;
    }[];
}
