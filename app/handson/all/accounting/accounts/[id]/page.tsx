import { getInvoice } from "@/app/actions/handson/all/accounting/invoices/getInvoice";
import { InvoiceForm } from "@/components/handson/invoice-form";
import { notFound } from "next/navigation";

interface PageProps {
    params: { id: string };
}

export default async function EditInvoicePage({ params }: PageProps) {
    const invoice = await getInvoice(params.id);

    if (!invoice) {
        notFound();
    }

    return (
        <div className="p-6">
            <InvoiceForm initialData={invoice} isEdit={true} />
        </div>
    );
}
