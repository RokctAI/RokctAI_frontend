import { getAsset } from "@/app/actions/handson/all/accounting/assets/getAsset";
import { AssetForm } from "@/components/handson/asset-form";
import { notFound } from "next/navigation";

interface PageProps {
    params: { id: string };
}

export default async function EditAssetPage({ params }: PageProps) {
    const asset = await getAsset(params.id);

    if (!asset) {
        notFound();
    }

    return (
        <div className="p-6">
            <AssetForm initialData={asset} isEdit={true} />
        </div>
    );
}
