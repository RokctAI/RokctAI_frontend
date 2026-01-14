"use client";

import { Loader2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getProduct, createProduct, updateProduct, getInventory, adjustInventory } from "@/app/actions/paas/products";
import { ImageUpload } from "@/components/custom/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProductFormProps {
    params: {
        id: string;
    };
}

export default function ProductFormPage({ params }: ProductFormProps) {
    const router = useRouter();
    const isNew = params.id === "new";
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: 0,
        image: "",
        category: "",
        unit: "",
        active: 1,
        status: "published"
    });

    useEffect(() => {
        if (!isNew) {
            async function fetchProduct() {
                try {
                    const product = await getProduct(params.id);
                    if (product) {
                        setFormData({
                            title: product.title || "",
                            description: product.description || "",
                            price: product.price || 0,
                            image: product.image || "",
                            category: product.category || "",
                            unit: product.unit || "",
                            active: product.active ?? 1,
                            status: product.status || "published"
                        });
                    } else {
                        toast.error("Product not found");
                        router.push("/paas/dashboard/products");
                    }
                } catch (error) {
                    console.error("Error fetching product:", error);
                    toast.error("Failed to load product");
                } finally {
                    setLoading(false);
                }
            }
            fetchProduct();
        }
    }, [isNew, params.id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isNew) {
                await createProduct(formData);
                toast.success("Product created successfully");
            } else {
                await updateProduct(params.id, formData);
                toast.success("Product updated successfully");
            }
            router.push("/paas/dashboard/products");
        } catch (error) {
            console.error("Error saving product:", error);
            toast.error("Failed to save product");
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
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/paas/dashboard/products">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="size-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">{isNew ? "Create Product" : "Edit Product"}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Input
                            id="unit"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            placeholder="e.g. kg, pcs"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="Category ID or Name"
                    />
                </div>

                <ImageUpload
                    label="Product Image"
                    value={formData.image}
                    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                />

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="published">Published</option>
                            <option value="pending">Pending</option>
                            <option value="unpublished">Unpublished</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="active">Active</Label>
                        <select
                            id="active"
                            name="active"
                            value={formData.active}
                            onChange={(e) => setFormData(prev => ({ ...prev, active: parseInt(e.target.value) }))}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value={1}>Yes</option>
                            <option value={0}>No</option>
                        </select>
                    </div>
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
                            Save Product
                        </>
                    )}
                </Button>
            </form>

            {!isNew && <InventoryManager itemCode={params.id} />}
        </div>
    );
}

function InventoryManager({ itemCode }: { itemCode: string }) {
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadInventory();
    }, [itemCode]);

    async function loadInventory() {
        try {
            const data = await getInventory(itemCode);
            setInventory(data);
        } catch (error) {
            console.error("Error loading inventory:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleUpdate = async (warehouse: string, newQty: number) => {
        setUpdating(true);
        try {
            await adjustInventory(itemCode, warehouse, newQty);
            toast.success("Inventory updated");
            loadInventory();
        } catch (error) {
            toast.error("Failed to update inventory");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div>Loading inventory...</div>;

    return (
        <div className="space-y-4 border-t pt-8">
            <h2 className="text-2xl font-bold">Inventory</h2>
            <div className="grid gap-4">
                {inventory.length === 0 ? (
                    <p className="text-muted-foreground">No inventory records found.</p>
                ) : (
                    inventory.map((item) => (
                        <div key={item.warehouse} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">{item.warehouse}</p>
                                <p className="text-sm text-muted-foreground">Current Stock: {item.actual_qty}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    className="w-24"
                                    defaultValue={item.actual_qty}
                                    onBlur={(e) => handleUpdate(item.warehouse, parseFloat(e.target.value))}
                                    disabled={updating}
                                />
                                <span className="text-sm text-muted-foreground">Qty</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
