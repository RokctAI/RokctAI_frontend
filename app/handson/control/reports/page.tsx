"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BarChart3, Plus, Trash2, Save, PlayCircle, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import {
    ReportDefinition,
    getGlobalReports,
    saveGlobalReport,
    deleteGlobalReport,
    seedReports
} from "@/app/actions/handson/control/reports/reports";

const CHART_TYPES = [
    { label: "Bar Chart", value: "bar" },
    { label: "Line Chart", value: "line" },
    { label: "Pie Chart", value: "pie" },
    { label: "Doughnut Chart", value: "doughnut" },
    { label: "Table Only", value: "table" }
];

const CATEGORIES = ["Sales", "Financial", "Operations", "CRM", "Stock"];

export default function ReportsPage() {
    const [reports, setReports] = useState<ReportDefinition[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Default Empty Report
    const [editingReport, setEditingReport] = useState<ReportDefinition>({
        title: "",
        category: "Sales",
        sql: "SELECT * FROM `tabUser` LIMIT 5",
        chart_type: "bar",
        is_active: true
    });

    useEffect(() => {
        loadReports();
    }, []);

    async function loadReports() {
        setLoading(true);
        try {
            const data = await getGlobalReports();
            setReports(data || []);
        } catch (e) {
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    }

    async function handleSeed() {
        setLoading(true);
        await seedReports();
        toast.success("Seeded example reports");
        loadReports();
    }

    async function handleSave() {
        if (!editingReport.title || !editingReport.sql) {
            toast.error("Title and SQL are required");
            return;
        }
        try {
            await saveGlobalReport(editingReport);
            toast.success("Report saved");
            setIsEditOpen(false);
            loadReports();
        } catch (e) {
            toast.error("Failed to save report");
        }
    }

    async function handleDelete(name?: string) {
        if (!name || !confirm("Delete this report?")) return;
        await deleteGlobalReport(name);
        toast.success("Report deleted");
        loadReports();
    }

    const openNew = () => {
        setEditingReport({
            title: "",
            category: "Sales",
            sql: "SELECT DATE_FORMAT(transaction_date, '%Y-%m') as date, SUM(grand_total) as value FROM `tabSales Invoice` GROUP BY date",
            chart_type: "bar",
            x_axis_field: "date",
            y_axis_field: "value",
            is_active: true
        });
        setIsEditOpen(true);
    };

    const openEdit = (rep: ReportDefinition) => {
        setEditingReport({ ...rep });
        setIsEditOpen(true);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <BarChart3 className="h-8 w-8" /> Report Builder
                    </h1>
                    <p className="text-muted-foreground">Define SQL-based analytics to push to all tenants.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSeed}>
                        <PlayCircle className="mr-2 h-4 w-4" /> Seed Examples
                    </Button>
                    <Button onClick={openNew}>
                        <Plus className="mr-2 h-4 w-4" /> New Report
                    </Button>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((rep) => (
                    <Card key={rep.name} className="relative hover:shadow-md transition-shadow group">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline">{rep.category}</Badge>
                                <Badge className={rep.is_active ? "bg-green-600" : "bg-gray-400"}>
                                    {rep.chart_type.toUpperCase()}
                                </Badge>
                            </div>
                            <CardTitle className="leading-tight mt-2">{rep.title}</CardTitle>
                            <CardDescription className="line-clamp-2 text-xs font-mono bg-muted p-1 rounded mt-2">
                                {rep.sql}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-end mt-4 gap-2 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" onClick={() => openEdit(rep)}>Edit</Button>
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(rep.name)}>Delete</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {reports.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <BarChart3 className="mx-auto h-12 w-12 opacity-20 mb-4" />
                    <p>No reports defined. Click "Seed Examples" to get started.</p>
                </div>
            )}

            {/* Editor Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingReport.name ? "Edit Report" : "Create New Report"}</DialogTitle>
                        <DialogDescription>
                            Queries run on the Tenant Site locally. Use standard SQL (MariaDB).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Report Title</Label>
                                <Input value={editingReport.title} onChange={(e) => setEditingReport({ ...editingReport, title: e.target.value })} placeholder="e.g. Monthly Revenue" />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={editingReport.category} onValueChange={(val) => setEditingReport({ ...editingReport, category: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>SQL Query</Label>
                            <Textarea
                                className="font-mono text-sm h-[150px]"
                                value={editingReport.sql}
                                onChange={(e) => setEditingReport({ ...editingReport, sql: e.target.value })}
                                placeholder="SELECT ... FROM `tabSales Invoice` ..."
                            />
                            <p className="text-xs text-muted-foreground">
                                Access Frappe tables using backticks: `tabDocType`. Do not use DELETE/UPDATE/DROP statements.
                            </p>
                        </div>

                        <div className="space-y-3 border p-4 rounded-lg bg-muted/20">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" /> Visualization Config
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Chart Type</Label>
                                    <Select value={editingReport.chart_type} onValueChange={(val: any) => setEditingReport({ ...editingReport, chart_type: val })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {CHART_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {editingReport.chart_type !== "table" && (
                                    <>
                                        <div className="space-y-2">
                                            <Label>X-Axis Field (Label)</Label>
                                            <Input placeholder="e.g. date" value={editingReport.x_axis_field || ""} onChange={(e) => setEditingReport({ ...editingReport, x_axis_field: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Y-Axis Field (Value)</Label>
                                            <Input placeholder="e.g. total" value={editingReport.y_axis_field || ""} onChange={(e) => setEditingReport({ ...editingReport, y_axis_field: e.target.value })} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description (Internal Note)</Label>
                            <Input value={editingReport.description || ""} onChange={(e) => setEditingReport({ ...editingReport, description: e.target.value })} placeholder="Explain what this report shows..." />
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch checked={editingReport.is_active} onCheckedChange={(c) => setEditingReport({ ...editingReport, is_active: c })} />
                            <Label>Active (Visible to Tenants)</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Definition</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
