"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    getSwaggerSettings,
    getSwaggerAppRenames,
    getExcludedDoctypes,
    getExcludedSwaggerModules,
    getExcludedSwaggerDoctypes,
    getTenantErrorLogs,
    getRawNeurotrophinCache,
    getRawTenderCache,
    generateSwaggerDocumentation,
    deleteSwaggerAppRename,
    deleteExcludedDoctype,
    deleteExcludedSwaggerModule,
    deleteExcludedSwaggerDoctype
} from "@/app/actions/handson/control/developer/developer";

export default function DeveloperPage() {
    const [swaggerSettings, setSwaggerSettings] = useState<any[]>([]);
    const [appRenames, setAppRenames] = useState<any[]>([]);
    const [excludedDoctypes, setExcludedDoctypes] = useState<any[]>([]);
    const [excludedModules, setExcludedModules] = useState<any[]>([]);
    const [excludedSwaggerDoctypes, setExcludedSwaggerDoctypes] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [neuroCache, setNeuroCache] = useState<any[]>([]);
    const [tenderCache, setTenderCache] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchData() {
        setLoading(true);
        try {
            const [
                swaggerData, renamesData,
                exDocsData, exModsData, exSwagDocsData,
                logsData, neuroData, tenderData
            ] = await Promise.all([
                getSwaggerSettings(),
                getSwaggerAppRenames(),
                getExcludedDoctypes(),
                getExcludedSwaggerModules(),
                getExcludedSwaggerDoctypes(),
                getTenantErrorLogs(),
                getRawNeurotrophinCache(),
                getRawTenderCache()
            ]);
            setSwaggerSettings(swaggerData || []);
            setAppRenames(renamesData || []);
            setExcludedDoctypes(exDocsData || []);
            setExcludedModules(exModsData || []);
            setExcludedSwaggerDoctypes(exSwagDocsData || []);
            setLogs(logsData || []);
            setNeuroCache(neuroData || []);
            setTenderCache(tenderData || []);
        } catch (error) {
            console.error("Error fetching developer data:", error);
            toast.error("Failed to fetch developer data");
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteAppRename(name: string) {
        if (!confirm("Are you sure you want to delete this rename?")) return;
        try {
            await deleteSwaggerAppRename(name);
            toast.success("Rename deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete rename");
        }
    }

    async function handleDeleteExcludedDoctype(name: string) {
        if (!confirm("Are you sure you want to delete this exclusion?")) return;
        try {
            await deleteExcludedDoctype(name);
            toast.success("Exclusion deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete exclusion");
        }
    }

    async function handleDeleteExcludedModule(name: string) {
        if (!confirm("Are you sure you want to delete this exclusion?")) return;
        try {
            await deleteExcludedSwaggerModule(name);
            toast.success("Exclusion deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete exclusion");
        }
    }

    async function handleDeleteExcludedSwaggerDoctype(name: string) {
        if (!confirm("Are you sure you want to delete this exclusion?")) return;
        try {
            await deleteExcludedSwaggerDoctype(name);
            toast.success("Exclusion deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete exclusion");
        }
    }

    async function handleGenerateSwagger() {
        try {
            const res = await generateSwaggerDocumentation();
            if (res && res.message) {
                toast.success(res.message);
            } else {
                toast.success("Swagger generation enqueued");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to enqueue generation");
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Developer Tools</h1>
                    <p className="text-muted-foreground">Manage swagger settings, logs, and caches.</p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchData} title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            <Tabs defaultValue="swagger">
                <TabsList className="flex-wrap h-auto">
                    <TabsTrigger value="swagger">Swagger</TabsTrigger>
                    <TabsTrigger value="exclusions">Exclusions</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                    <TabsTrigger value="cache">Cache</TabsTrigger>
                </TabsList>

                <TabsContent value="swagger" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Swagger Settings</CardTitle>
                                    <CardDescription>API documentation configuration.</CardDescription>
                                </div>
                                <Button onClick={handleGenerateSwagger}>Generate Documentation</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Version</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {swaggerSettings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                No settings found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        swaggerSettings.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.title}</TableCell>
                                                <TableCell>{item.version}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Swagger App Rename</CardTitle>
                            <CardDescription>Renaming apps in Swagger.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Original Name</TableHead>
                                        <TableHead>New Name</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appRenames.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                No renames found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        appRenames.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>

                                                <TableCell>{item.original_name}</TableCell>
                                                <TableCell>{item.new_name}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteAppRename(item.name)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="exclusions" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Excluded Doctypes</CardTitle>
                            <CardDescription>Doctypes excluded from processing.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Doctype</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {excludedDoctypes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                                                No excluded doctypes found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        excludedDoctypes.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>{item.doctype_name}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteExcludedDoctype(item.name)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Excluded Swagger Modules</CardTitle>
                            <CardDescription>Modules excluded from Swagger.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Module</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {excludedModules.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                                                No excluded modules found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        excludedModules.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.module_name}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteExcludedModule(item.name)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Excluded Swagger Doctypes</CardTitle>
                            <CardDescription>Doctypes excluded from Swagger.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Doctype</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {excludedSwaggerDoctypes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                                                No excluded swagger doctypes found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        excludedSwaggerDoctypes.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>{item.doctype_name}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteExcludedSwaggerDoctype(item.name)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="logs" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tenant Error Logs</CardTitle>
                            <CardDescription>Error logs from tenants.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Error</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Tenant</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No logs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="max-w-[300px] truncate" title={item.error}>{item.error}</TableCell>
                                                <TableCell>{item.timestamp ? format(new Date(item.timestamp), "MMM d, yyyy HH:mm") : "-"}</TableCell>
                                                <TableCell>{item.tenant}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cache" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Raw Neurotrophin Cache</CardTitle>
                            <CardDescription>Cached neurotrophin data.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Key</TableHead>
                                        <TableHead>Expires At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {neuroCache.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                No cache found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        neuroCache.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.key}</TableCell>
                                                <TableCell>{item.expires_at ? format(new Date(item.expires_at), "MMM d, yyyy HH:mm") : "-"}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Raw Tender Cache</CardTitle>
                            <CardDescription>Cached tender data.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Key</TableHead>
                                        <TableHead>Expires At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tenderCache.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                No cache found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        tenderCache.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.key}</TableCell>
                                                <TableCell>{item.expires_at ? format(new Date(item.expires_at), "MMM d, yyyy HH:mm") : "-"}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
