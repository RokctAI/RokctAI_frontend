"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Printer, Save, Edit2, Plus, Trash2, Eye, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    MasterPrintFormat,
    getMasterPrintFormats,
    saveMasterPrintFormat,
    deleteMasterPrintFormat
} from "@/app/actions/handson/control/print_formats/print_formats";

export default function MasterPrintFormatsPage() {
    const [formats, setFormats] = useState<MasterPrintFormat[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingFormat, setEditingFormat] = useState<MasterPrintFormat | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);

    // Mock data for preview (similar to tenant side)
    const SAMPLE_INVOICE_DATA = {
        invoice_qr_display: true,
        print_logo: "https://via.placeholder.com/150/000000/FFFFFF?text=Logo",
        company_logo: "https://via.placeholder.com/150/FFFFFF/000000?text=Logo",
        name: "INV-SAMPLE-001",
        company: "Global SaaS Corp",
        company_address: "1 Cloud Way, Internet City",
        customer_name: "John Doe",
        address_display: "456 Client Ln, Suburbia",
        posting_date: "2024-12-10",
        due_date: "2024-12-20",
        net_total: "$1,250.00",
        total_taxes_and_charges: "$150.00",
        grand_total: "$1,400.00",
        items: [
            { item_name: "Consulting Services", description: "Project Alpha", qty: 10, rate: 100, amount: 1000 },
            { item_name: "Server Hosting", description: "Annual Plan", qty: 1, rate: 250, amount: 250 }
        ]
    };

    const SAMPLE_APPOINTMENT_DATA = {
        company_logo: "https://via.placeholder.com/150/FFFFFF/000000?text=Logo",
        company: "Global SaaS Corp",
        company_address: "1 Cloud Way, Internet City",
        applicant_name: "Alice Smith",
        applicant_address: "789 Job St, Career City",
        custom_date: "2024-12-11",
        designation: "Senior Developer",
        joining_date: "2025-01-01",
        location: "Remote",
        total_salary: "$120,000"
    };

    const SAMPLE_PAYSLIP_DATA = {
        company: "Global SaaS Corp",
        month: "November",
        year: "2024",
        employee_name: "Alice Smith",
        designation: "Senior Developer",
        department: "Engineering",
        bank_name: "Tech Bank",
        earnings: [
            { salary_component: "Basic", amount: "5000" },
            { salary_component: "HRA", amount: "2000" }
        ],
        deductions: [
            { salary_component: "Tax", amount: "500" }
        ],
        net_pay: "6500"
    };

    const SAMPLE_EXPERIENCE_DATA = {
        company_logo: "https://via.placeholder.com/150/FFFFFF/000000?text=Logo",
        company: "Global SaaS Corp",
        company_address: "1 Cloud Way, Internet City",
        employee_name: "Alice Smith",
        designation: "Senior Developer",
        joining_date: "2020-01-01",
        relieving_date: "2024-12-31"
    };

    const SAMPLE_NOC_DATA = {
        company_logo: "https://via.placeholder.com/150/FFFFFF/000000?text=Logo",
        company: "Global SaaS Corp",
        custom_date: "2024-12-11",
        employee_name: "Alice Smith",
        designation: "Senior Developer",
        purpose: "Apply for Visa"
    };

    useEffect(() => {
        loadFormats();
    }, []);

    useEffect(() => {
        if (editingFormat?.doc_type === "Appointment Letter" || editingFormat?.doc_type === "Offer Letter") {
            setPreviewData(SAMPLE_APPOINTMENT_DATA);
        } else if (editingFormat?.doc_type === "Salary Slip") {
            setPreviewData(SAMPLE_PAYSLIP_DATA);
        } else if (editingFormat?.doc_type === "Experience Certificate") {
            setPreviewData(SAMPLE_EXPERIENCE_DATA);
        } else if (editingFormat?.doc_type === "No Objection Certificate") {
            setPreviewData(SAMPLE_NOC_DATA);
        } else {
            setPreviewData(SAMPLE_INVOICE_DATA);
        }
    }, [editingFormat?.doc_type]);

    async function loadFormats() {
        setLoading(true);
        try {
            const data = await getMasterPrintFormats();
            setFormats(data || []);
        } catch (e) {
            toast.error("Failed to load formats");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!editingFormat || !editingFormat.name) return;

        try {
            await saveMasterPrintFormat(editingFormat.name, editingFormat.doc_type, editingFormat.html);
            toast.success("Format saved");
            setEditingFormat(null);
            setIsNew(false);
            loadFormats();
        } catch (e) {
            toast.error("Failed to save format");
        }
    }

    async function handleDelete(name: string) {
        if (!confirm("Are you sure you want to delete this format?")) return;
        try {
            await deleteMasterPrintFormat(name);
            toast.success("Format deleted");
            loadFormats();
        } catch (e) {
            toast.error("Failed to delete format");
        }
    }

    const openEdit = (fmt: MasterPrintFormat) => {
        setEditingFormat({ ...fmt });
        setIsNew(false);
    };

    const openNew = () => {
        setEditingFormat({ name: "", doc_type: "Sales Invoice", html: "<h1>New Format</h1>", standard: false });
        setIsNew(true);
    };

    // Simple Jinja-like renderer for preview (reused logic)
    const renderPreview = (template: string, data: any) => {
        if (!data) return template;
        let rendered = template;

        const ifRegex = /\{%\s*if\s+(\w+)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g;
        rendered = rendered.replace(ifRegex, (_, conditionVar, content) => {
            return data[conditionVar] ? content : "";
        });

        rendered = rendered.replace(/\{\{\s*doc\.(\w+)\s(?:or\s*doc\.(\w+)\s)*\}\}/g, (match, firstVar, secondVar) => {
            if (match.includes(" or ")) {
                return data[firstVar] || data[secondVar] || "";
            }
            return data[firstVar] || "";
        });

        rendered = rendered.replace(/\{\{\s*doc\.(\w+)\s*\}\}/g, (_, key) => data[key] || "");

        const loopRegex = /\{%\s*for\s+(\w+)\s+in\s+doc\.(\w+)\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}/g;
        rendered = rendered.replace(loopRegex, (_, itemVar, listKey, content) => {
            const list = data[listKey] || [];
            return list.map((item: any) => {
                return content.replace(new RegExp(`\\{\\{\\s*${itemVar}\\.(\\w+)\\s*\\}\\}`, 'g'), (__: any, key: string) => item[key] || "");
            }).join("");
        });

        return rendered;
    };

    if (editingFormat) {
        return (
            <div className="h-[calc(100vh-4rem)] flex flex-col p-4 gap-4">
                <div className="flex justify-between items-center bg-background py-2">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Edit2 className="h-6 w-6" /> {isNew ? "New Format" : "Editing " + editingFormat.name}
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditingFormat(null)}>Cancel</Button>
                        <Button onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" /> Save
                        </Button>
                    </div>
                </div>

                <div className="flex gap-4 mb-2">
                    <Input
                        placeholder="Format Name (e.g. Modern Blue)"
                        value={editingFormat.name}
                        onChange={(e) => setEditingFormat({ ...editingFormat, name: e.target.value })}
                        disabled={!isNew}
                        className="w-[300px]"
                    />
                    <Select
                        value={editingFormat.doc_type}
                        onValueChange={(val) => setEditingFormat({ ...editingFormat, doc_type: val })}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="DocType" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Sales Invoice">Sales Invoice</SelectItem>
                            <SelectItem value="Quotation">Quotation</SelectItem>
                            <SelectItem value="POS Invoice">POS Invoice</SelectItem>
                            <SelectItem value="Offer Letter">Offer Letter</SelectItem>
                            <SelectItem value="Appointment Letter">Appointment Letter</SelectItem>
                            <SelectItem value="Salary Slip">Salary Slip</SelectItem>
                            <SelectItem value="Experience Certificate">Experience Certificate</SelectItem>
                            <SelectItem value="No Objection Certificate">No Objection Certificate</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4 h-full overflow-hidden">
                    <Card className="flex flex-col h-full overflow-hidden">
                        <CardHeader className="py-2 bg-muted/30 border-b">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Code className="h-4 w-4" /> Source Code (HTML/Jinja)
                            </CardTitle>
                        </CardHeader>
                        <div className="flex-1 p-0">
                            <Textarea
                                className="w-full h-full resize-none border-0 rounded-none font-mono text-xs p-4 focus-visible:ring-0"
                                value={editingFormat.html}
                                onChange={(e) => setEditingFormat({ ...editingFormat, html: e.target.value })}
                            />
                        </div>
                    </Card>

                    <Card className="flex flex-col h-full overflow-hidden bg-white">
                        <CardHeader className="py-2 bg-muted/30 border-b">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Eye className="h-4 w-4" /> Preview
                            </CardTitle>
                        </CardHeader>
                        <div className="flex-1 p-8 overflow-auto bg-white">
                            <div
                                className="print-preview-content prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: renderPreview(editingFormat.html, previewData) }}
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
            </div >
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Master Print Formats</h1>
                    <p className="text-muted-foreground">Design PDF layouts that can be used by all tenants.</p>
                </div>
                <Button onClick={openNew}>
                    <Plus className="mr-2 h-4 w-4" /> New Format
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Format Name</TableHead>
                            <TableHead>DocType</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : formats.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                    No custom formats found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            formats.map((f) => (
                                <TableRow key={f.name}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Printer className="h-4 w-4 text-muted-foreground" />
                                            {f.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{f.doc_type}</TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(f)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(f.name)}>
                                            <Trash2 className="h-4 w-4" />
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
