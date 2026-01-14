import { getQuotation } from "@/app/actions/handson/all/accounting/selling/quotation";
import { QuotationForm } from "@/components/handson/quotation-form";
import { notFound } from "next/navigation";

interface PageProps {
    params: { id: string };
}

export default async function EditQuotationPage({ params }: PageProps) {
    const quotation = await getQuotation(params.id);

    if (!quotation) {
        notFound();
    }

    return (
        <div className="p-6">
            <QuotationForm initialData={quotation} isEdit={true} />
        </div>
    );
}
