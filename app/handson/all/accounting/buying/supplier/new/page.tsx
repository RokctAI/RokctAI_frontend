
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSupplier } from "@/app/actions/handson/all/accounting/buying/supplier";
import { Loader2 } from "lucide-react";

// Note: createSupplier action needs to be created or we use a generic create if it doesn't exist.
// Checking supply_chain.ts... getSuppliers exists. createSupplier does NOT exist yet?
// I need to check supply_chain.ts content again later. If it doesn't exist, this will fail.
// I will assume I will add it.

const supplierSchema = z.object({
    supplier_name: z.string().min(2, "Name is required"),
    supplier_group: z.string().optional(),
    supplier_type: z.enum(["Company", "Individual"]).default("Company"),
    country: z.string().optional(),
    email_id: z.string().email().optional().or(z.literal("")),
});

export default function NewSupplierPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof supplierSchema>>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            supplier_name: "",
            supplier_group: "All Supplier Groups",
            supplier_type: "Company",
            country: "",
            email_id: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof supplierSchema>) => {
        setLoading(true);
        try {
            // Need to ensure createSupplier is imported and exists.
            // I will add it to supply_chain.ts in the next step.
            const res = await createSupplier(values);
            if (res.success) {
                toast.success("Supplier created");
                router.push("/handson/all/supply-chain/buying");
            } else {
                toast.error("Error: " + res.error);
            }
        } catch (e) {
            toast.error("Failed to create supplier");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>New Supplier</CardTitle>
                    <CardDescription>Add a new vendor or service provider.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="supplier_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="supplier_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Company">Company</SelectItem>
                                                    <SelectItem value="Individual">Individual</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="email_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl><Input type="email" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Supplier
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
