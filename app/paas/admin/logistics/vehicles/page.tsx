"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getVehicleTypes, createVehicleType, deleteVehicleType } from "@/app/actions/paas/admin/logistics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


export default function AdminVehicleTypesPage() {
    const [types, setTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newType, setNewType] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchTypes();
    }, []);

    async function fetchTypes() {
        try {
            const data = await getVehicleTypes();
            setTypes(data);
        } catch (error) {
            console.error("Error fetching vehicle types:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleCreate = async () => {
        try {
            await createVehicleType({ name: newType });
            toast.success("Vehicle type created");
            setNewType("");
            setIsDialogOpen(false);
            fetchTypes();
        } catch (error) {
            toast.error("Failed to create vehicle type");
        }
    };

    const handleDelete = async (name: string) => {
        if (!confirm("Delete this vehicle type?")) return;
        try {
            await deleteVehicleType(name);
            toast.success("Vehicle type deleted");
            fetchTypes();
        } catch (error) {
            toast.error("Failed to delete vehicle type");
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
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Vehicle Types</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 size-4" />
                            Add Type
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Vehicle Type</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Input
                                placeholder="Vehicle Type Name (e.g., Bike, Car)"
                                value={newType}
                                onChange={(e) => setNewType(e.target.value)}
                            />
                            <Button onClick={handleCreate} className="w-full">Create</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {types.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center h-24">
                                    No vehicle types found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            types.map((type) => (
                                <TableRow key={type.name}>
                                    <TableCell className="font-medium">
                                        {type.name}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600"
                                            onClick={() => handleDelete(type.name)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
