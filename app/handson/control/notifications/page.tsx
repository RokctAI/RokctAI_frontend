"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Save, Edit2, Plus, Info } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

import {
    NotificationTemplate,
    getMasterTemplates,
    saveMasterTemplate,
    createMasterTemplate
} from "@/app/actions/handson/control/notifications/templates";
import { PLATFORM_NAME, getGuestBranding } from "@/app/config/platform";
import React from "react";

export default function NotificationTemplatesPage() {
    const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [branding, setBranding] = useState<any>(null);

    useEffect(() => {
        getGuestBranding().then(setBranding);
        loadTemplates();
    }, []);

    async function loadTemplates() {
        setLoading(true);
        try {
            const data = await getMasterTemplates();
            setTemplates(data || []);
        } catch (e) {
            toast.error("Failed to load templates");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!editingTemplate || !editingTemplate.name) return;

        try {
            if (isNew) {
                await createMasterTemplate(editingTemplate.name, editingTemplate.subject, editingTemplate.response);
                toast.success("Template created");
            } else {
                await saveMasterTemplate(editingTemplate.name, editingTemplate.subject, editingTemplate.response);
                toast.success("Template updated");
            }
            setEditingTemplate(null);
            setIsNew(false);
            loadTemplates();
        } catch (e) {
            toast.error("Failed to save template");
        }
    }

    const openEdit = (template: NotificationTemplate) => {
        setEditingTemplate({ ...template });
        setIsNew(false);
    };

    const openNew = () => {
        setEditingTemplate({ name: "", subject: "", response: "" });
        setIsNew(true);
    };

    // Mock Data for Preview
    const PREVIEW_DATA = {
        doc: {
            name: "INV-2024-001",
            customer_name: "John Doe",
            grand_total: "$500.00",
            company: branding ? (
                <span>
                    {branding.before}
                    <span style={branding.style}>{branding.code}</span>
                    {branding.after} SaaS
                </span>
            ) : `${PLATFORM_NAME} SaaS`,
            status: "Paid",
            items: [
                { item_name: "Service A", amount: 100 },
                { item_name: "Service B", amount: 400 }
            ]
        }
    };

    const renderPreview = (html: string) => {
        let rendered = html;
        // Simple Jinja-like replacement
        rendered = rendered.replace(/\{\{\s*doc\.(\w+)\s*\}\}/g, (_, key) => (PREVIEW_DATA.doc as any)[key] || `{{ ${key} }}`);
        return rendered;
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Master Notification Templates</h1>
                    <p className="text-muted-foreground">Manage standard email templates pushed to new tenants.</p>
                </div>
                <Button onClick={openNew}>
                    <Plus className="mr-2 h-4 w-4" /> New Template
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Template Name</TableHead>
                            <TableHead>Subject Line</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : templates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                    No templates found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            templates.map((t) => (
                                <TableRow key={t.name}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            {t.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{t.subject}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
                <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{isNew ? "New Template" : "Edit Template"}</DialogTitle>
                        <DialogDescription>
                            Design your email using HTML. We provide sample data for preview.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 grid grid-cols-2 gap-6 min-h-0 py-4">
                        {/* Left: Editor */}
                        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                            <div className="space-y-2">
                                <Label>Template Name (ID)</Label>
                                <Input
                                    value={editingTemplate?.name || ""}
                                    onChange={(e) => setEditingTemplate(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                                    disabled={!isNew}
                                    placeholder="e.g. Welcome Email"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Subject Line</Label>
                                <Input
                                    value={editingTemplate?.subject || ""}
                                    onChange={(e) => setEditingTemplate(prev => prev ? ({ ...prev, subject: e.target.value }) : null)}
                                    placeholder="Welcome to our platform!"
                                />
                            </div>
                            <div className="flex-1 flex flex-col space-y-2">
                                <Label>Email Body (HTML)</Label>
                                <Textarea
                                    className="flex-1 font-mono text-sm resize-none"
                                    value={editingTemplate?.response || ""}
                                    onChange={(e) => setEditingTemplate(prev => prev ? ({ ...prev, response: e.target.value }) : null)}
                                    placeholder="Hi {{ doc.customer_name }}, ..."
                                />
                            </div>
                        </div>

                        {/* Right: Preview */}
                        <div className="flex flex-col gap-2 rounded-lg border bg-slate-50 overflow-hidden">
                            <div className="p-3 border-b bg-white text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Live Preview
                            </div>
                            <div className="flex-1 p-6 overflow-y-auto">
                                <div
                                    className="prose prose-sm max-w-none bg-white p-8 shadow-sm rounded-md min-h-full"
                                    dangerouslySetInnerHTML={{
                                        __html: renderPreview(editingTemplate?.response || "")
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
                        <Button onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
