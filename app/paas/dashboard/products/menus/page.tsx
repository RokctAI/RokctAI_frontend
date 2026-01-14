"use client";

import { Loader2, Plus, Trash2, Menu as MenuIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getMenus, createMenu, deleteMenu } from "@/app/actions/paas/operations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MenusPage() {
    const [menus, setMenus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({ name: "" });

    useEffect(() => {
        fetchMenus();
    }, []);

    async function fetchMenus() {
        try {
            const data = await getMenus();
            setMenus(data);
        } catch (error) {
            console.error("Error fetching menus:", error);
            toast.error("Failed to load menus");
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Menu name is required");
            return;
        }

        setProcessing(true);
        try {
            await createMenu(formData);
            toast.success("Menu created successfully");
            setIsDialogOpen(false);
            setFormData({ name: "" });
            fetchMenus();
        } catch (error) {
            console.error("Error creating menu:", error);
            toast.error("Failed to create menu");
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (name: string) => {
        if (!confirm("Are you sure you want to delete this menu?")) return;
        try {
            await deleteMenu(name);
            toast.success("Menu deleted successfully");
            fetchMenus();
        } catch (error) {
            console.error("Error deleting menu:", error);
            toast.error("Failed to delete menu");
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
                    <h1 className="text-3xl font-bold">Menus</h1>
                    <p className="text-muted-foreground">Manage your product menus.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    Add Menu
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menus.length === 0 ? (
                    <Card className="col-span-full">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No menus found. Create one to get started.
                        </CardContent>
                    </Card>
                ) : (
                    menus.map((menu) => (
                        <Card key={menu.name}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {menu.name}
                                </CardTitle>
                                <MenuIcon className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end mt-4">
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(menu.name)}>
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
                        <DialogTitle>Add Menu</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Menu Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. Lunch Menu"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSubmit} disabled={processing}>
                            {processing ? <Loader2 className="size-4 animate-spin" /> : "Create Menu"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
