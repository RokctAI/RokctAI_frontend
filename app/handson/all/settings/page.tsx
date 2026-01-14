"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { getCompanyDetails, updateCompanyDetails } from "@/app/actions/handson/all/settings/general";

const brandingSchema = z.object({
    company_name: z.string().min(1, "Company Name is required"),
    company_logo: z.string().optional(),
    print_logo: z.string().optional(),
});

export default function BrandingSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [companyId, setCompanyId] = useState<string | null>(null);

    const form = useForm<z.infer<typeof brandingSchema>>({
        resolver: zodResolver(brandingSchema),
        defaultValues: {
            company_name: "",
            company_logo: "",
            print_logo: ""
        }
    });

    useEffect(() => {
        async function fetchCompany() {
            try {
                const company = await getCompanyDetails();
                if (company) {
                    setCompanyId(company.name);
                    form.reset({
                        company_name: company.company_name || "",
                        company_logo: company.company_logo || "",
                        print_logo: company.print_logo || ""
                    });
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load company details");
            } finally {
                setLoading(false);
            }
        }
        fetchCompany();
    }, [form]);

    async function onSubmit(values: z.infer<typeof brandingSchema>) {
        if (!companyId) return;
        try {
            await updateCompanyDetails(companyId, values);
            toast.success("Branding settings saved");
        } catch (error) {
            toast.error("Failed to save branding settings");
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Company Branding</h1>
                    <p className="text-muted-foreground">Manage your company identity and logos.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Branding Settings</CardTitle>
                    <CardDescription>Manage your company logo and print assets.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField control={form.control} name="company_name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField control={form.control} name="company_logo" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Default Logo URL</FormLabel>
                                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                                        <FormDescription>Used for light backgrounds (Invoices, Normal View)</FormDescription>
                                        <FormMessage />
                                        {field.value && <img src={field.value} alt="Preview" className="mt-2 h-12 object-contain" />}
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="print_logo" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Print / Dark Mode Logo URL</FormLabel>
                                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                                        <FormDescription>Used for dark headers (Tokyo POS, Rio Invoice)</FormDescription>
                                        <FormMessage />
                                        {field.value && <div className="mt-2 p-2 bg-gray-800 rounded inline-block"><img src={field.value} alt="Preview" className="h-12 object-contain" /></div>}
                                    </FormItem>
                                )} />
                            </div>

                            <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save Branding</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
