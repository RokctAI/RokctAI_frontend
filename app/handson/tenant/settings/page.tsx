"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    getTenantEmailSettings, updateTenantEmailSettings
} from "@/app/actions/handson/tenant/settings/email";
import {
    getSynapticSettings, updateSynapticSettings, getStimulusCategories
} from "@/app/actions/handson/tenant/settings/synaptic";
import {
    getCompanySettings, updateCompanySettings
} from "@/app/actions/handson/tenant/settings/company";
import TermsSettings from "./terms-settings";

const emailSettingsSchema = z.object({
    enable_custom_smtp: z.boolean().default(false),
    smtp_server: z.string().optional(),
    smtp_port: z.coerce.number().optional(),
    use_tls: z.boolean().default(false),
    username: z.string().optional(),
    password: z.string().optional()
});

const tenderSettingsSchema = z.object({
    main_procurement_category: z.string().optional()
});

const regulatorySettingsSchema = z.object({
    credit_provider_license: z.string().optional(),
    tax_id: z.string().optional()
});

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);

    const emailForm = useForm<z.infer<typeof emailSettingsSchema>>({
        resolver: zodResolver(emailSettingsSchema),
        defaultValues: { enable_custom_smtp: false }
    });

    const tenderForm = useForm<z.infer<typeof tenderSettingsSchema>>({
        resolver: zodResolver(tenderSettingsSchema),
        defaultValues: { main_procurement_category: "" }
    });

    const regulatoryForm = useForm<z.infer<typeof regulatorySettingsSchema>>({
        resolver: zodResolver(regulatorySettingsSchema),
        defaultValues: { credit_provider_license: "", tax_id: "" }
    });

    async function fetchData() {
        setLoading(true);
        try {
            const [emailData, synapticData, catData, companyData] = await Promise.all([
                getTenantEmailSettings(),
                getSynapticSettings(),
                getStimulusCategories(),
                getCompanySettings()
            ]);

            if (emailData) {
                emailForm.reset({
                    enable_custom_smtp: !!emailData.enable_custom_smtp,
                    smtp_server: emailData.smtp_server || "",
                    smtp_port: emailData.smtp_port || 587,
                    use_tls: !!emailData.use_tls,
                    username: emailData.username || "",
                    password: emailData.password || ""
                });
            }

            if (synapticData) {
                tenderForm.reset({
                    main_procurement_category: synapticData.main_procurement_category || ""
                });
            }

            if (companyData) {
                regulatoryForm.reset({
                    credit_provider_license: companyData.credit_provider_license || "",
                    tax_id: companyData.tax_id || ""
                });
            }

            setCategories(catData || []);

        } catch (error) {
            console.error(error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const onEmailSubmit = async (values: z.infer<typeof emailSettingsSchema>) => {
        try {
            await updateTenantEmailSettings(values);
            toast.success("Email settings saved");
        } catch (error) {
            toast.error("Failed to save email settings");
        }
    };

    const onTenderSubmit = async (values: z.infer<typeof tenderSettingsSchema>) => {
        try {
            await updateSynapticSettings(values);
            toast.success("Tender preferences saved");
        } catch (error) {
            toast.error("Failed to save tender preferences");
        }
    };

    const onRegulatorySubmit = async (values: z.infer<typeof regulatorySettingsSchema>) => {
        try {
            await updateCompanySettings(values);
            toast.success("Regulatory settings saved");
        } catch (error) {
            toast.error("Failed to save regulatory settings");
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const enabled = emailForm.watch("enable_custom_smtp");

    return (
        <div className="space-y-8 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Tenant Settings</h1>
                    <p className="text-muted-foreground">Configure global tenant behavior.</p>
                </div>
            </div>

            <Tabs defaultValue="email">
                <TabsList>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="tenders">Tender Preferences</TabsTrigger>
                    <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
                    <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
                </TabsList>

                {/* --- Email Settings --- */}
                <TabsContent value="email" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Settings</CardTitle>
                            <CardDescription>Configure custom SMTP for outgoing emails.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...emailForm}>
                                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                                    <FormField control={emailForm.control} name="enable_custom_smtp" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Enable Custom SMTP</FormLabel>
                                                <CardDescription>Use your own SMTP server instead of the system default.</CardDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )} />

                                    {enabled && (
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <FormField control={emailForm.control} name="smtp_server" render={({ field }) => (
                                                <FormItem><FormLabel>SMTP Server</FormLabel><FormControl><Input placeholder="smtp.example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={emailForm.control} name="smtp_port" render={({ field }) => (
                                                <FormItem><FormLabel>Port</FormLabel><FormControl><Input type="number" placeholder="587" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={emailForm.control} name="username" render={({ field }) => (
                                                <FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={emailForm.control} name="password" render={({ field }) => (
                                                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={emailForm.control} name="use_tls" render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 md:col-span-2">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">Use TLS</FormLabel>
                                                    </div>
                                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                    )}

                                    <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Tender Preferences --- */}
                <TabsContent value="tenders" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tender Preferences</CardTitle>
                            <CardDescription>Configure which tenders are fetched for your tenant.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...tenderForm}>
                                <form onSubmit={tenderForm.handleSubmit(onTenderSubmit)} className="space-y-6">
                                    <FormField control={tenderForm.control} name="main_procurement_category" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Main Procurement Category</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat.name} value={cat.name}>{cat.category_name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save Preferences</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Regulatory --- */}
                <TabsContent value="regulatory" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Regulatory Information</CardTitle>
                            <CardDescription>Manage company licenses and tax details (Self-Declared).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...regulatoryForm}>
                                <form onSubmit={regulatoryForm.handleSubmit(onRegulatorySubmit)} className="space-y-6">
                                    <FormField control={regulatoryForm.control} name="credit_provider_license" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Credit Provider License Number</FormLabel>
                                            <FormControl><Input placeholder="e.g. NCRCP12345" {...field} /></FormControl>
                                            <CardDescription>Required if offering interest-bearing loans.</CardDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={regulatoryForm.control} name="tax_id" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tax ID / VAT Number</FormLabel>
                                            <FormControl><Input placeholder="e.g. 4000123456" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save Regulatory Info</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Terms & Conditions --- */}
                <TabsContent value="terms" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Legal & Terms</CardTitle>
                            <CardDescription>Manage standard terms and conditions for your documents.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TermsSettings />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
