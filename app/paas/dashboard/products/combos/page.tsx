"use client";

import { Loader2, Plus, Trash2, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getCombos, createCombo, deleteCombo } from "@/app/actions/paas/operations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CombosPage() {
    const [combos, setCombos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({ name: "", price: 0 });

    useEffect(() => {
        fetchCombos();
    }, []);

    async function fetchCombos() {
        try {
            const data = await getCombos();
            setCombos(data);
        } catch (error) {
            console.error("Error fetching combos:", error);
            toast.error("Failed to load combos");
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Combo name is required");
            return;
        }

        setProcessing(true);
        try {
            await createCombo(formData);
            toast.success("Combo created successfully");
            setIsDialogOpen(false);
            setFormData({ name: "", price: 0 });
            fetchCombos();
        } catch (error) {
            console.error("Error creating combo:", error);
            toast.error("Failed to create combo");
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (name: string) => {
        if (!confirm("Are you sure you want to delete this combo?")) return;
        try {
            await deleteCombo(name);
            toast.success("Combo deleted successfully");
            fetchCombos();
        } catch (error) {
            console.error("Error deleting combo:", error);
            toast.error("Failed to delete combo");
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
                    <h1 className="text-3xl font-bold">Combos</h1>
                    <p className="text-muted-foreground">Manage product combos and deals.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    Add Combo
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {combos.length === 0 ? (
                    <Card className="col-span-full">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No combos found. Create one to get started.
                        </CardContent>
                    </Card>
                ) : (
                    combos.map((combo) => (
                        <Card key={combo.name}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {combo.name}
                                </CardTitle>
                                <Package className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="font-bold">
                                        ${combo.price.toFixed(2)}
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(combo.name)}>
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
                        <DialogTitle>Add Combo</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Combo Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. Lunch Deal"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSubmit} disabled={processing}>
                            {processing ? <Loader2 className="size-4 animate-spin" /> : "Create Combo"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
