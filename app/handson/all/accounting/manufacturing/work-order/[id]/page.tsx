import { getWorkOrder } from "@/app/actions/handson/all/accounting/manufacturing/work_order";
import { WorkOrderForm } from "@/components/handson/work-order-form";
import { notFound } from "next/navigation";

interface PageProps {
    params: { id: string };
}

export default async function ViewWorkOrderPage({ params }: PageProps) {
    const wo = await getWorkOrder(params.id);

    if (!wo) {
        notFound();
    }

    return (
        <div className="p-6">
            <WorkOrderForm initialData={wo} isEdit={true} />
        </div>
    );
}
