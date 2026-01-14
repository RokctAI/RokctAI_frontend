"use client";

import { Loader2, Plus, Trash2, ChefHat } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getKitchens, createKitchen, deleteKitchen } from "@/app/actions/paas/operations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function KitchensPage() {
    const [kitchens, setKitchens] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({ name: "", active: 1 });

    useEffect(() => {
        fetchKitchens();
    }, []);

    async function fetchKitchens() {
        try {
            const data = await getKitchens();
            setKitchens(data);
        } catch (error) {
            console.error("Error fetching kitchens:", error);
            toast.error("Failed to load kitchens");
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Kitchen name is required");
            return;
        }

        setProcessing(true);
        try {
            await createKitchen(formData);
            toast.success("Kitchen created successfully");
            setIsDialogOpen(false);
            setFormData({ name: "", active: 1 });
            fetchKitchens();
        } catch (error) {
            console.error("Error creating kitchen:", error);
            toast.error("Failed to create kitchen");
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (name: string) => {
        if (!confirm("Are you sure you want to delete this kitchen?")) return;
        try {
            await deleteKitchen(name);
            toast.success("Kitchen deleted successfully");
            fetchKitchens();
        } catch (error) {
            console.error("Error deleting kitchen:", error);
            toast.error("Failed to delete kitchen");
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
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Kitchens</h1>
                    <p className="text-muted-foreground">Manage your restaurant kitchens.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    Add Kitchen
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kitchens.length === 0 ? (
                    <Card className="col-span-full">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No kitchens found. Create one to get started.
                        </CardContent>
                    </Card>
                ) : (
                    kitchens.map((kitchen) => (
                        <Card key={kitchen.name}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {kitchen.name}
                                </CardTitle>
                                <ChefHat className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mt-4">
                                    <div className={`text-sm px-2 py-1 rounded-full ${kitchen.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {kitchen.active ? 'Active' : 'Inactive'}
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(kitchen.name)}>
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Kitchen</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Kitchen Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. Main Kitchen"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="active"
                                checked={!!formData.active}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked ? 1 : 0 }))}
                            />
                            <Label htmlFor="active">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSubmit} disabled={processing}>
                            {processing ? <Loader2 className="size-4 animate-spin" /> : "Create Kitchen"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
