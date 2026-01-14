import { getQuotations } from "@/app/actions/handson/all/accounting/selling/quotation";
import { QuotationList } from "@/components/handson/quotation-list";

export const dynamic = "force-dynamic";

export default async function SellingPage() {
    const quotations = await getQuotations();

    return (
        <div className="p-6">
            <QuotationList quotations={quotations} />
        </div>
    );
}
