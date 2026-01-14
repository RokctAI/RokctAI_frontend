"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Printer, Save, Eye, Code, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { getPrintFormats, savePrintFormat, PrintFormat } from "@/app/actions/handson/tenant/settings/printing";
import { getCompanySettings, updateCompanySettings } from "@/app/actions/handson/tenant/settings/company";

export default function PrintSettingsPage() {
    const [formats, setFormats] = useState<PrintFormat[]>([]);
    const [selectedFormat, setSelectedFormat] = useState<PrintFormat | null>(null);
    const [htmlContent, setHtmlContent] = useState("");
    const [previewData, setPreviewData] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);

    useEffect(() => {
        loadFormats();
        loadCompany();
    }, []);

    async function loadCompany() {
        const c = await getCompanySettings();
        setCompany(c);
    }

    async function loadFormats() {
        const data = await getPrintFormats("Sales Invoice");
        setFormats(data);
        if (data.length > 0) {
            selectFormat(data[0]);
        }
    }

    const selectFormat = (fmt: PrintFormat) => {
        setSelectedFormat(fmt);
        setHtmlContent(fmt.format);
        // Dummy data for preview
        setPreviewData({
            invoice_qr_display: true,
            print_logo: company?.print_logo || "https://via.placeholder.com/150/000000/FFFFFF?text=Dark+Mode+Logo",
            company_logo: company?.company_logo || "https://via.placeholder.com/150/FFFFFF/000000?text=Company+Logo",
            name: "INV-2024-001",
            company: company?.company_name || "Acme Corp",
            company_address: "123 Business Rd, Tech City",
            customer_name: "John Doe",
            address_display: "456 Client Ln, Suburbia",
            posting_date: "2024-12-10",
            due_date: "2024-12-20",
            net_total: "$1,250.00",
            total_taxes_and_charges: "$0.00",
            grand_total: "$1,250.00",
            items: [
                { item_name: "Consulting Services", description: "Project Alpha", qty: 10, rate: 100, amount: 1000 },
                { item_name: "Server Hosting", description: "Annual Plan", qty: 1, rate: 250, amount: 250 }
            ]
        });
    };

    const handleSave = async () => {
        if (!selectedFormat) return;
        await savePrintFormat(selectedFormat.name, htmlContent);
        toast.success("Print format saved");
    };

    const handleSetDefault = async () => {
        if (!company || !selectedFormat) return;
        try {
            await updateCompanySettings({ name: company.name, default_print_format: selectedFormat.name });
            toast.success(`Set ${selectedFormat.name} as default`);
            loadCompany();
        } catch (e) {
            toast.error("Failed to set default");
        }
    };

    // Simple Jinja-like renderer for preview
    const renderPreview = (template: string, data: any) => {
        if (!data) return template;
        let rendered = template;

        // Handle {% if variable %} ... {% endif %}
        const ifRegex = /\{%\s*if\s+(\w+)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g;
        rendered = rendered.replace(ifRegex, (_, conditionVar, content) => {
            // Check if variable exists and is truthy in data
            return data[conditionVar] ? content : "";
        });

        // Simple variable replacement {{ doc.field }}
        // Added handling for "or" logic (e.g. {{ doc.a or doc.b }})
        rendered = rendered.replace(/\{\{\s*doc\.(\w+)\s(?:or\s*doc\.(\w+)\s)*\}\}/g, (match, firstVar, secondVar) => {
            if (match.includes(" or ")) {
                return data[firstVar] || data[secondVar] || "";
            }
            return data[firstVar] || "";
        });

        // Handling nested object properties somewhat loosely for legacy support
        rendered = rendered.replace(/\{\{\s*doc\.(\w+)\s*\}\}/g, (_, key) => data[key] || "");


        // Very basic loop handling {% for item in doc.items %} ... {% endfor %}
        const loopRegex = /\{%\s*for\s+(\w+)\s+in\s+doc\.(\w+)\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}/g;
        rendered = rendered.replace(loopRegex, (_, itemVar, listKey, content) => {
            const list = data[listKey] || [];
            return list.map((item: any) => {
                return content.replace(new RegExp(`\\{\\{\\s*${itemVar}\\.(\\w+)\\s*\\}\\}`, 'g'), (__: any, key: string) => item[key] || "");
            }).join("");
        });

        return rendered;
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col p-4 gap-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Printer className="h-6 w-6" /> Print Formats
                    </h1>
                    <Select value={selectedFormat?.name} onValueChange={(val) => {
                        const f = formats.find(x => x.name === val);
                        if (f) selectFormat(f);
                    }}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select Format" />
                        </SelectTrigger>
                        <SelectContent>
                            {formats.map(f => (
                                <SelectItem key={f.name} value={f.name}>
                                    {f.name}
                                    {company?.default_print_format === f.name && <span className="ml-2 text-xs text-green-600 font-bold">(Default)</span>}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {company?.default_print_format === selectedFormat?.name && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Active Default</Badge>
                    )}
                </div>
                <div className="flex gap-2">
                    {selectedFormat && company?.default_print_format !== selectedFormat.name && (
                        <Button variant="outline" onClick={handleSetDefault}>
                            Set as Default
                        </Button>
                    )}
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4 h-full overflow-hidden">
                {/* Editor */}
                <Card className="flex flex-col h-full overflow-hidden">
                    <CardHeader className="py-2 bg-muted/30 border-b">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Code className="h-4 w-4" /> HTML Editor (Jinja)
                        </CardTitle>
                    </CardHeader>
                    <div className="flex-1 p-0">
                        <Textarea
                            className="w-full h-full resize-none border-0 rounded-none font-mono text-xs p-4 focus-visible:ring-0"
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                        />
                    </div>
                </Card>

                {/* Preview */}
                <Card className="flex flex-col h-full overflow-hidden bg-white">
                    <CardHeader className="py-2 bg-muted/30 border-b">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Eye className="h-4 w-4" /> Live Preview
                        </CardTitle>
                    </CardHeader>
                    <div className="flex-1 p-8 overflow-auto bg-white">
                        <div
                            className="print-preview-content prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: renderPreview(htmlContent, previewData) }}
                        />
                        <style jsx global>{`
                            .print-preview-content table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            .print-preview-content th, .print-preview-content td { padding: 8px; border-bottom: 1px solid #ddd; }
                            .print-preview-content .text-right { text-align: right; }
                            .print-preview-content .text-muted { color: #666; }
                            .print-preview-content .row { display: flex; margin-bottom: 20px; }
                            .print-preview-content .col-6 { width: 50%; }
                        `}</style>
                    </div>
                </Card>
            </div>
        </div>
    );
}
