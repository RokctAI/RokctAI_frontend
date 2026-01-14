import { Badge } from "@/components/ui/badge";
import { CreateDealDialog } from "@/components/handson/deals/create-deal-dialog";
import { getDocTypeMeta } from "@/app/actions/handson/all/crm/meta";
import { getDeals } from "@/app/actions/handson/all/crm/deals";
import { DealsClientView } from "@/components/handson/deals/deals-client-view";

export default async function DealsPage() {
    const [dealsRes, metaRes] = await Promise.all([
        getDeals(1, 50),
        getDocTypeMeta("CRM Deal")
    ]);
    const deals = dealsRes.data || [];
    const meta = metaRes;

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
                    <p className="text-muted-foreground">Manage your sales pipeline.</p>
                </div>
                <CreateDealDialog meta={meta.data!} />
            </div>

            <DealsClientView deals={deals} />
        </div>
    );
}
