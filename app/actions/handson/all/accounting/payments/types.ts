export interface PaymentData {
    payment_type: "Pay" | "Receive";
    party_type: "Customer" | "Supplier";
    party: string;
    paid_amount: number;
    reference_no?: string;
    reference_date?: string;
}
