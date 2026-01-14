import { getProspects } from "@/app/actions/handson/all/crm/prospects";

export default async function ProspectsPage() {
    const { data: prospects } = await getProspects();

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Prospects</h1>
                    <p className="text-muted-foreground">Manage potential customers and market segments.</p>
                </div>
            </div>

            <div className="border rounded-lg p-4">
                <pre className="text-xs">{JSON.stringify(prospects, null, 2)}</pre>
            </div>
        </div>
    );
}
