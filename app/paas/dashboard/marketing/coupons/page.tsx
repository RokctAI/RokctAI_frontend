"use client";

import { format } from "date-fns";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/app/actions/paas/marketing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<any>(null);

    // Form state
    const [code, setCode] = useState("");
    const [quantity, setQuantity] = useState("");
    const [expiredAt, setExpiredAt] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const data = await getCoupons();
            setCoupons(data);
        } catch (error) {
            console.error("Error fetching coupons:", error);
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    }

    const resetForm = () => {
        setCode("");
        setQuantity("");
        setExpiredAt("");
        setEditingCoupon(null);
    };

    const handleOpenDialog = (coupon?: any) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setCode(coupon.code);
            setQuantity(coupon.quantity);
            setExpiredAt(coupon.expired_at ? coupon.expired_at.split(' ')[0] : ""); // Format for date input
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!code) {
            toast.error("Coupon code is required");
            return;
        }

        setProcessing(true);
        try {
            const data = {
                code,
                quantity: parseInt(quantity) || 0,
                expired_at: expiredAt || null
            };

            if (editingCoupon) {
                await updateCoupon(editingCoupon.name, data);
                toast.success("Coupon updated successfully");
            } else {
                await createCoupon(data);
                toast.success("Coupon created successfully");
            }
            setIsDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error saving coupon:", error);
            toast.error("Failed to save coupon");
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (name: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;

        try {
            await deleteCoupon(name);
            toast.success("Coupon deleted successfully");
            fetchData();
        } catch (error) {
            console.error("Error deleting coupon:", error);
            toast.error("Failed to delete coupon");
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
                    <h1 className="text-3xl font-bold">Coupons</h1>
                    <p className="text-muted-foreground">Manage discount coupons for your shop.</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 size-4" />
                    Create Coupon
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Coupons</CardTitle>
                    <CardDescription>List of all coupons available for your customers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Expires At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No coupons found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                coupons.map((coupon) => (
                                    <TableRow key={coupon.name}>
                                        <TableCell className="font-medium">{coupon.code}</TableCell>
                                        <TableCell>{coupon.quantity}</TableCell>
                                        <TableCell>
                                            {coupon.expired_at ? format(new Date(coupon.expired_at), 'MMM d, yyyy') : "No Expiry"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(coupon)}>
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(coupon.name)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
                        <DialogDescription>
                            {editingCoupon ? "Update the details of your coupon." : "Create a new coupon code for your customers."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="code" className="text-right">
                                Code
                            </Label>
                            <Input
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="col-span-3"
                                placeholder="SUMMER2025"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="quantity" className="text-right">
                                Quantity
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="col-span-3"
                                placeholder="100"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="expiredAt" className="text-right">
                                Expires At
                            </Label>
                            <Input
                                id="expiredAt"
                                type="date"
                                value={expiredAt}
                                onChange={(e) => setExpiredAt(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSubmit} disabled={processing}>
                            {processing ? <Loader2 className="size-4 animate-spin" /> : (editingCoupon ? "Update Coupon" : "Create Coupon")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
