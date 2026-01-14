import { getPurchaseOrder } from "@/app/actions/handson/all/accounting/buying/order";
import { PurchaseOrderForm } from "@/components/handson/purchase-order-form";
import { notFound } from "next/navigation";

interface PageProps {
    params: { id: string };
}

export default async function EditPurchaseOrderPage({ params }: PageProps) {
    const order = await getPurchaseOrder(params.id);

    if (!order) {
        notFound();
    }

    return (
        <div className="p-6">
            <PurchaseOrderForm initialData={order} isEdit={true} />
        </div>
    );
}
