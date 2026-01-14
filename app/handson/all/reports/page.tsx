"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BarChart3, TrendingUp, PieChart, Table as TableIcon, RefreshCw, AlertTriangle } from "lucide-react";
import {
    BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { getGlobalReports, ReportDefinition } from "@/app/actions/handson/control/reports/reports";
import { executeReportQuery } from "@/app/actions/handson/all/reports/analytics";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function TenantReportsPage() {
    const [reports, setReports] = useState<ReportDefinition[]>([]);
    const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(null);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDefinitions();
    }, []);

    useEffect(() => {
        if (selectedReport) {
            runReport(selectedReport);
        }
    }, [selectedReport]);

    async function loadDefinitions() {
        try {
            const defs = await getGlobalReports();
            setReports(defs.filter(d => d.is_active));
            if (defs.length > 0 && !selectedReport) {
                setSelectedReport(defs[0]);
            }
        } catch (e) {
            toast.error("Failed to load report definitions");
        }
    }

    async function runReport(report: ReportDefinition) {
        setLoading(true);
        setError("");
        setData([]);
        try {
            const res = await executeReportQuery(report.sql);
            if (res.success) {
                setData(res.data || []);
            } else {
                setError(res.error || "Failed to execute query");
            }
        } catch (e) {
            setError("Unexpected execution error");
        } finally {
            setLoading(false);
        }
    }

    const renderChart = () => {
        if (!selectedReport || data.length === 0) return null;
        const { chart_type, x_axis_field, y_axis_field } = selectedReport;

        // Safety: If config is missing, fallback to table
        if (chart_type !== 'table' && (!x_axis_field || !y_axis_field)) {
            return <Alert variant="destructive"><AlertTitle>Configuration Error</AlertTitle><AlertDescription>Missing Axis configuration.</AlertDescription></Alert>;
        }

        const ChartContainer = () => (
            <ResponsiveContainer width="100%" height={400}>
                {chart_type === 'bar' ? (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={x_axis_field} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey={y_axis_field!} fill="#8884d8" name={y_axis_field} />
                    </BarChart>
                ) : chart_type === 'line' ? (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={x_axis_field} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey={y_axis_field!} stroke="#82ca9d" />
                    </LineChart>
                ) : chart_type === 'pie' ? (
                    <RechartsPieChart>
                        <Pie data={data} dataKey={y_axis_field!} nameKey={x_axis_field!} cx="50%" cy="50%" outerRadius={120} fill="#8884d8" label>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </RechartsPieChart>
                ) : (
                    // Default / Table fallback
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    {Object.keys(data[0]).map(k => <th key={k} className="p-2 text-left font-medium">{k}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, i) => (
                                    <tr key={i} className="border-b">
                                        {Object.values(row).map((v: any, j) => <td key={j} className="p-2">{String(v)}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </ResponsiveContainer>
        );

        if (chart_type === 'table') {
            return (
                <div className="overflow-x-auto border rounded-md">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                {Object.keys(data[0] || {}).map(k => <th key={k} className="p-2 text-left font-medium">{k}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, i) => (
                                <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                                    {Object.values(row).map((v: any, j) => <td key={j} className="p-2">{String(v)}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        return <ChartContainer />;
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <BarChart3 className="h-8 w-8" /> Analytics
                    </h1>
                    <p className="text-muted-foreground">Insights and reports powered by HQ.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => selectedReport && runReport(selectedReport)} disabled={loading || !selectedReport}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar List */}
                <div className="md:col-span-1 space-y-2">
                    {reports.map(rep => (
                        <div
                            key={rep.name}
                            onClick={() => setSelectedReport(rep)}
                            className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedReport?.name === rep.name ? 'bg-primary/10 border-primary shadow-sm' : 'hover:bg-muted border-transparent'}`}
                        >
                            <div className="flex justify-between mb-1">
                                <Badge variant="outline" className="text-[10px] h-5">{rep.category}</Badge>
                                {rep.chart_type === 'bar' && <BarChart3 className="h-4 w-4 text-muted-foreground" />}
                                {rep.chart_type === 'line' && <TrendingUp className="h-4 w-4 text-muted-foreground" />}
                                {rep.chart_type === 'pie' && <PieChart className="h-4 w-4 text-muted-foreground" />}
                                {rep.chart_type === 'table' && <TableIcon className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <h3 className="font-semibold text-sm">{rep.title}</h3>
                        </div>
                    ))}
                    {reports.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center p-4">No reports available.</div>
                    )}
                </div>

                {/* Main Content */}
                <Card className="md:col-span-3 min-h-[500px]">
                    <CardHeader>
                        {selectedReport ? (
                            <>
                                <CardTitle>{selectedReport.title}</CardTitle>
                                <CardDescription>{selectedReport.description}</CardDescription>
                            </>
                        ) : (
                            <CardTitle className="text-muted-foreground">Select a report to view</CardTitle>
                        )}
                    </CardHeader>
                    <CardContent>
                        {error ? (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : loading ? (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                <RefreshCw className="mr-2 h-6 w-6 animate-spin" /> Loading data...
                            </div>
                        ) : (data.length > 0 && selectedReport) ? (
                            renderChart()
                        ) : selectedReport ? (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed rounded-lg">
                                No data returned for this period.
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
