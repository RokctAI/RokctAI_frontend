"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save, Building } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompanyDetails, updateCompanyDetails } from "@/app/actions/handson/all/settings/general";

const companySettingsSchema = z.object({
    company_name: z.string().min(2, "Company Name is required"),
    country: z.string().min(2, "Country is required"),
    default_currency: z.string().min(3, "Currency Code is required"),
    tax_id: z.string().optional(),
    domain: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

export function CompanySettingsForm() {
    const [loading, setLoading] = useState(true);
    const [companyId, setCompanyId] = useState<string | null>(null);

    const form = useForm<z.infer<typeof companySettingsSchema>>({
        resolver: zodResolver(companySettingsSchema),
        defaultValues: {
            company_name: "",
            country: "",
            default_currency: "",
            tax_id: "",
            domain: "",
            email: "",
        },
    });

    useEffect(() => {
        getCompanyDetails().then((data) => {
            if (data) {
                setCompanyId(data.name);
                form.reset({
                    company_name: data.company_name,
                    country: data.country,
                    default_currency: data.default_currency,
                    tax_id: data.tax_id || "",
                    domain: data.domain || "",
                    email: data.email || "",
                });
            }
            setLoading(false);
        });
    }, []);

    const onSubmit = async (values: z.infer<typeof companySettingsSchema>) => {
        if (!companyId) return;

        try {
            const res = await updateCompanyDetails(companyId, values);
            if (res.success) {
                toast.success("Company Settings updated");
            } else {
                toast.error("Failed to update settings: " + res.error);
            }
        } catch (error) {
            toast.error("An error occurred while saving.");
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    Company Settings
                </CardTitle>
                <CardDescription>Manage your company details, currency, and primary contact info.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="company_name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="country" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="default_currency" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Default Currency (e.g. USD, ZAR)</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="tax_id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tax ID / VAT Number</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="domain" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Domain</FormLabel>
                                    <FormControl><Input {...field} placeholder="example.com" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl><Input {...field} type="email" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="flex justify-end">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Settings
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
