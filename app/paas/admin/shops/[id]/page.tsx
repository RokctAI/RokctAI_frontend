"use client";

import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createShop, updateShop, getShops, getShopTypes } from "@/app/actions/paas/admin/shops";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ShopFormPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const isNew = params.id === "new";
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        shop_name: "",
        user: "",
        shop_type: "",
        is_ecommerce: false
    });
    const [shopTypes, setShopTypes] = useState<any[]>([]);

    useEffect(() => {
        const init = async () => {
            await fetchShopTypes();
            if (!isNew) {
                await fetchShop();
            }
        };
        init();
    }, [params.id]);

    async function fetchShopTypes() {
        try {
            const types = await getShopTypes();
            setShopTypes(types);
        } catch (error) {
            console.error("Error fetching shop types:", error);
        }
    }

    async function fetchShop() {
        try {
            // Since we don't have a direct getShop API that returns full details by ID in the list,
            // we might need to rely on the list or add a specific getShop action.
            // For now, let's re-use getShops and filter, or assume we can fetch it.
            // Ideally, we should add a getShop(id) to the actions.
            // Let's assume we can fetch all and find it for now to save time, 
            // but for production we'd want a specific endpoint.
            const shops = await getShops();
            const shop = shops.find((s: any) => s.name === params.id);
            if (shop) {
                setFormData({
                    shop_name: shop.shop_name,
                    user: shop.user,
                    shop_type: shop.shop_type || "",
                    is_ecommerce: !!shop.is_ecommerce
                });
            }
        } catch (error) {
            console.error("Error fetching shop:", error);
            toast.error("Failed to load shop details");
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isNew) {
                await createShop(formData);
                toast.success("Shop created successfully");
            } else {
                await updateShop(params.id, formData);
                toast.success("Shop updated successfully");
            }
            router.push("/paas/admin/shops");
        } catch (error) {
            toast.error("Failed to save shop");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/paas/admin/shops">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">{isNew ? "Create Shop" : "Edit Shop"}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Shop Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="shop_name">Shop Name</Label>
                            <Input
                                id="shop_name"
                                value={formData.shop_name}
                                onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user">Owner User (Email)</Label>
                            <Input
                                id="user"
                                value={formData.user}
                                onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shop_type">Shop Type</Label>
                            <select
                                id="shop_type"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.shop_type}
                                onChange={(e) => setFormData({ ...formData, shop_type: e.target.value })}
                            >
                                <option value="">Select a type...</option>
                                {shopTypes.map((type) => (
                                    <option key={type.name} value={type.name}>
                                        {type.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center space-x-2 py-2">
                            <input
                                type="checkbox"
                                id="is_ecommerce"
                                checked={formData.is_ecommerce}
                                onChange={(e) => setFormData({ ...formData, is_ecommerce: e.target.checked })}
                                className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="is_ecommerce">Is Ecommerce (Nationwide via Courier)</Label>
                        </div>
                        <Button type="submit" className="w-full" disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 size-4" />
                                    Save Shop
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
