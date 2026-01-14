import { getBOM } from "@/app/actions/handson/all/accounting/manufacturing/bom";
import { BOMForm } from "@/components/handson/bom-form";
import { notFound } from "next/navigation";

interface PageProps {
    params: { id: string };
}

export default async function ViewBOMPage({ params }: PageProps) {
    const bom = await getBOM(params.id);

    if (!bom) {
        notFound();
    }

    return (
        <div className="p-6">
            <BOMForm initialData={bom} isEdit={true} />
        </div>
    );
}
