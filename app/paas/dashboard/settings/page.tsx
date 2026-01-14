"use client";

import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getShop, updateShop } from "@/app/actions/paas/shop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";


export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        address: "",
        phone: "",
        min_amount: 0,
        tax: 0,
        delivery_time_type: "minutes",
        delivery_time_from: 0,
        delivery_time_to: 0,
        logo_img: "",
        background_img: "",
        enable_cod: true
    });

    useEffect(() => {
        async function fetchShop() {
            try {
                const shop = await getShop();
                if (shop) {
                    setFormData({
                        title: shop.title || "",
                        description: shop.description || "",
                        address: shop.address || "",
                        phone: shop.phone || "",
                        min_amount: shop.min_amount || 0,
                        tax: shop.tax || 0,
                        delivery_time_type: shop.delivery_time?.type || "minutes",
                        delivery_time_from: shop.delivery_time?.from || 0,
                        delivery_time_to: shop.delivery_time?.to || 0,
                        logo_img: shop.logo_img || "",
                        background_img: shop.background_img || "",
                        enable_cod: shop.enable_cod ?? true
                    });
                }
            } catch (error) {
                console.error("Error fetching shop:", error);
                toast.error("Failed to load shop settings");
            } finally {
                setLoading(false);
            }
        }
        fetchShop();
    }, []);

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
            await updateShop(formData);
            toast.success("Shop settings updated successfully");
        } catch (error) {
            console.error("Error updating shop:", error);
            toast.error("Failed to update settings");
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
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Shop Settings</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>General Information</CardTitle>
                        <CardDescription>Basic details about your shop.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Shop Name</Label>
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
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Delivery & Pricing</CardTitle>
                        <CardDescription>Configure delivery times and pricing rules.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="delivery_time_from">Delivery Time From</Label>
                                <Input
                                    id="delivery_time_from"
                                    name="delivery_time_from"
                                    type="number"
                                    value={formData.delivery_time_from}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="delivery_time_to">Delivery Time To</Label>
                                <Input
                                    id="delivery_time_to"
                                    name="delivery_time_to"
                                    type="number"
                                    value={formData.delivery_time_to}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="delivery_time_type">Unit</Label>
                                <select
                                    id="delivery_time_type"
                                    name="delivery_time_type"
                                    value={formData.delivery_time_type}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                    <option value="days">Days</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="min_amount">Minimum Order Amount</Label>
                                <Input
                                    id="min_amount"
                                    name="min_amount"
                                    type="number"
                                    value={formData.min_amount}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tax">Tax (%)</Label>
                                <Input
                                    id="tax"
                                    name="tax"
                                    type="number"
                                    value={formData.tax}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Images</CardTitle>
                        <CardDescription>Update your shop logo and cover photo.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="logo_img">Logo URL</Label>
                            <Input
                                id="logo_img"
                                name="logo_img"
                                value={formData.logo_img}
                                onChange={handleChange}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="background_img">Cover Photo URL</Label>
                            <Input
                                id="background_img"
                                name="background_img"
                                value={formData.background_img}
                                onChange={handleChange}
                                placeholder="https://..."
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Settings</CardTitle>
                        <CardDescription>Configure accepted payment methods.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Cash on Delivery (COD)</Label>
                                <p className="text-sm text-muted-foreground">
                                    Allow customers to pay with cash upon delivery.
                                </p>
                            </div>
                            <Switch
                                checked={formData.enable_cod}
                                onCheckedChange={(checked) =>
                                    setFormData(prev => ({ ...prev, enable_cod: checked }))
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={saving} size="lg">
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 size-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
