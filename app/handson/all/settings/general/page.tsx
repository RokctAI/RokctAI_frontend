"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NamingSeriesForm } from "@/components/handson/naming-series-form";
import { SystemSettingsForm } from "@/components/handson/system-settings-form";
import { CompanySettingsForm } from "@/components/handson/company-settings-form";
import ProductList from "../../lending/product/page";

export default function SetupPage() {
    const [selectedTemplate, setSelectedTemplate] = useState("unsecured");

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Unified Settings</h1>

            <Tabs defaultValue="lending" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="crm">CRM</TabsTrigger>
                    <TabsTrigger value="commercial">Commercial</TabsTrigger>
                    <TabsTrigger value="supply_chain">Supply Chain</TabsTrigger>
                    <TabsTrigger value="work">Work</TabsTrigger>
                    <TabsTrigger value="lending">Lending</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <div className="grid gap-6">
                        <SystemSettingsForm />
                        <CompanySettingsForm />
                    </div>
                </TabsContent>

                <TabsContent value="crm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader><CardTitle>Leads</CardTitle></CardHeader>
                            <CardContent>
                                <NamingSeriesForm doctype="Lead" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Opportunities</CardTitle></CardHeader>
                            <CardContent>
                                <NamingSeriesForm doctype="Opportunity" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Prospects</CardTitle></CardHeader>
                            <CardContent>
                                <NamingSeriesForm doctype="Prospect" />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="commercial">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader><CardTitle>Quotations</CardTitle></CardHeader>
                            <CardContent>
                                <NamingSeriesForm doctype="Quotation" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Sales Invoices</CardTitle></CardHeader>
                            <CardContent>
                                <NamingSeriesForm doctype="Sales Invoice" />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="supply_chain">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader><CardTitle>Purchase Orders</CardTitle></CardHeader>
                            <CardContent>
                                <NamingSeriesForm doctype="Purchase Order" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
                            <CardContent>
                                <NamingSeriesForm doctype="Item" />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="work">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
                            <CardContent>
                                <NamingSeriesForm doctype="Project" />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="lending">
                    <div className="space-y-8">
                        <div className="flex justify-between items-center bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Loan Products</h3>
                                <p className="text-gray-600 text-sm">Select a template to initialize a new compliant product.</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <select
                                    className="p-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                >
                                    <option value="unsecured">Unsecured Personal Loan (Max 28%)</option>
                                    <option value="shortterm">Short Term Micro Loan (Max 60%)</option>
                                </select>
                                <button
                                    onClick={async () => {
                                        const seeds = await import("@/app/actions/handson/all/lending/seed_product");
                                        let res;
                                        if (selectedTemplate === "unsecured") res = await seeds.createDefaultUnsecuredProduct();
                                        else res = await seeds.createDefaultShortTermProduct();

                                        if (res.success) alert(res.message);
                                        else alert("Notice: " + res.message);
                                    }}
                                    className="bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-sm"
                                >
                                    + Initialize Product
                                </button>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-6">
                            <ProductList />
                        </div>
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    );
}
