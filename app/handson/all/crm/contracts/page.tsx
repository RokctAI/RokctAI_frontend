import { CreateContractDialog } from "@/components/handson/contracts/create-contract-dialog";
import { ContractsClientView } from "@/components/handson/contracts/contracts-client-view";
import { getContracts } from "@/app/actions/handson/all/crm/contracts";
import { getDocTypeMeta } from "@/app/actions/handson/all/crm/meta";

export default async function ContractsPage() {
    const [contractsRes, metaRes] = await Promise.all([
        getContracts(),
        getDocTypeMeta("Contract")
    ]);

    const contracts = contractsRes.data || [];
    const meta = metaRes.data;

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
                    <p className="text-muted-foreground">Manage customer and supplier contracts.</p>
                </div>
                {meta && <CreateContractDialog meta={meta} />}
            </div>

            <ContractsClientView contracts={contracts} />
        </div>
    );
}
