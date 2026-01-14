import { getBOMs } from "@/app/actions/handson/all/accounting/manufacturing/bom";
import { BOMList } from "@/components/handson/bom-list";

export const dynamic = "force-dynamic";

export default async function BOMsPage() {
    const boms = await getBOMs();

    return (
        <div className="p-6">
            <BOMList boms={boms} />
        </div>
    );
}
