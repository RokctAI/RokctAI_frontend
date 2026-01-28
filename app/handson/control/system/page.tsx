"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Trash2, Check, X, ShieldCheck, Globe } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    getBrainSettings,
    getWeatherSettings,
    approveUpdate,
    rejectUpdate,
    deleteUpdateAuthorization
} from "@/app/actions/handson/control/system/system";

import {
    getGlobalSettings,
    toggleBetaMode,
    toggleDebugMode
} from "@/app/actions/handson/control/system/global-settings";

import {
    getRoadmaps,
    setPublicRoadmap,
    getPublicRoadmapSetting
} from "@/app/actions/handson/all/roadmap/roadmap";

export default function SystemPage() {
    const [brainSettings, setBrainSettings] = useState<any[]>([]);
    const [weatherSettings, setWeatherSettings] = useState<any[]>([]);
    const [auths, setAuths] = useState<any[]>([]);
    const [globalSettings, setGlobalSettings] = useState<any>(null);
    const [roadmaps, setRoadmaps] = useState<any[]>([]);
    const [publicRoadmapId, setPublicRoadmapId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    async function fetchData() {
        setLoading(true);
        try {
            const [brainData, weatherData, authsData, settingsData, roadmapsData, publicSetting] = await Promise.all([
                getBrainSettings(),
                getWeatherSettings(),
                getUpdateAuthorizations(),
                getGlobalSettings(),
                getRoadmaps(),
                getPublicRoadmapSetting()
            ]);
            setBrainSettings(brainData || []);
            setWeatherSettings(weatherData || []);
            setAuths(authsData || []);
            setGlobalSettings(settingsData);
            setRoadmaps(roadmapsData || []);
            setPublicRoadmapId(publicSetting?.public_roadmap || "none"); // Use "none" for select value if null
        } catch (error) {
            console.error("Error fetching system data:", error);
            toast.error("Failed to fetch system data");
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleBeta() {
        setSaving(true);
        try {
            const res = await toggleBetaMode();
            if (res.success) {
                setGlobalSettings({ ...globalSettings, isBetaMode: res.isBetaMode });
                toast.success(`Beta mode ${res.isBetaMode ? 'enabled' : 'disabled'}`);
            } else {
                toast.error("Failed to update beta mode");
            }
        } catch (error) {
            toast.error("Failed to update beta mode");
        } finally {
            setSaving(false);
        }
    }

    async function handleToggleDebug() {
        setSaving(true);
        try {
            const res = await toggleDebugMode();
            if (res.success) {
                setGlobalSettings({ ...globalSettings, isDebugMode: res.isDebugMode });
                toast.success(`Debug mode ${res.isDebugMode ? 'enabled' : 'disabled'}`);

                // Keep localStorage as a local cache for instant UI feedback elsewhere if needed
                if (res.isDebugMode) localStorage.setItem("rokct_debug_mode", "true");
                else localStorage.removeItem("rokct_debug_mode");
            } else {
                toast.error("Failed to update debug mode");
            }
        } catch (error) {
            toast.error("Failed to update debug mode");
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteAuth(name: string) {
        if (!confirm("Are you sure you want to delete this authorization?")) return;
        try {
            await deleteUpdateAuthorization(name);
            toast.success("Authorization deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete authorization");
        }
    }

    async function handleApprove(name: string) {
        try {
            await approveUpdate(name);
            toast.success("Update Authorized");
            fetchData();
        } catch (error) {
            toast.error("Failed to authorize");
        }
    }

    async function handleReject(name: string) {
        if (!confirm("Reject this update?")) return;
        try {
            await rejectUpdate(name);
            toast.success("Update Rejected");
            fetchData();
        } catch (error) {
            toast.error("Failed to reject");
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
                    <h1 className="text-3xl font-bold">System Settings</h1>
                    <p className="text-muted-foreground">Configure system-wide parameters and authorizations.</p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchData} title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            <Tabs defaultValue="brain">
                <TabsList>
                    <TabsTrigger value="brain">Brain Settings</TabsTrigger>
                    <TabsTrigger value="weather">Weather Settings</TabsTrigger>
                    <TabsTrigger value="auth">Update Authorization</TabsTrigger>
                    <TabsTrigger value="global">Global Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="brain" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Brain Settings</CardTitle>
                            <CardDescription>AI and Brain configuration.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Enabled</TableHead>
                                        <TableHead>Model</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {brainSettings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                No settings found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        brainSettings.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.enabled ? "Yes" : "No"}</TableCell>
                                                <TableCell>{item.model}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="weather" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Weather Settings</CardTitle>
                            <CardDescription>Weather service configuration.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>API Key</TableHead>
                                        <TableHead>Provider</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {weatherSettings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                No settings found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        weatherSettings.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.api_key}</TableCell>
                                                <TableCell>{item.provider}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="auth" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Update Authorization</CardTitle>
                            <CardDescription>System update authorizations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Authorized</TableHead>
                                        <TableHead>Authorized</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {auths.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                No authorizations found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        auths.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.user || item.requested_by}</TableCell>
                                                <TableCell>
                                                    {item.status === 'Authorized' ? (
                                                        <span className="flex items-center text-green-600"><ShieldCheck className="w-4 h-4 mr-1" /> Authorized</span>
                                                    ) : item.status === 'Rejected' ? (
                                                        <span className="text-red-600">Rejected</span>
                                                    ) : (
                                                        <span className="text-orange-500">Pending</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{item.app_name}</TableCell>
                                                <TableCell>{item.creation ? format(new Date(item.creation), "MMM d, yyyy") : "-"}</TableCell>
                                                <TableCell className="text-right flex justify-end gap-1">
                                                    {['Pending', 'Open'].includes(item.status) && (
                                                        <>
                                                            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleApprove(item.name)} title="Approve">
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleReject(item.name)} title="Reject">
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteAuth(item.name)} title="Delete">
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
                <TabsContent value="global" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global Platform Settings</CardTitle>
                            <CardDescription>Configure system-wide platform behavior.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Beta Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Displays the "Beta" badge next to the platform name site-wide.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    <Switch
                                        disabled={saving}
                                        checked={globalSettings?.isBetaMode ?? true}
                                        onCheckedChange={handleToggleBeta}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-base">Frontend Debug Mode (Local)</Label>
                                        <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded-full">Admin Only</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Enables showing detailed error messages in public components (like Pricing). This setting is saved to your browser only.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    <Switch
                                        disabled={saving}
                                        checked={globalSettings?.isDebugMode ?? false}
                                        onCheckedChange={handleToggleDebug}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Core Identifiers</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Admin API Key</span>
                                            <span className="font-mono">{globalSettings?.adminApiKey ? "****" + globalSettings.adminApiKey.slice(-4) : "Not Set"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Sync Secret</span>
                                            <span className="font-mono">{globalSettings?.platformSyncSecret ? "Configured" : "None"}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Public Roadmap Setting */}
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-base">Public Roadmap</Label>
                                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full">Global</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Select which roadmap is displayed in the public footer.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 w-[250px]">
                                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    <Select
                                        disabled={saving}
                                        value={publicRoadmapId || "none"}
                                        onValueChange={async (val) => {
                                            setSaving(true);
                                            try {
                                                const newVal = val === "none" ? null : val;
                                                await setPublicRoadmap(newVal);
                                                setPublicRoadmapId(val);
                                                toast.success("Public Roadmap Updated");
                                            } catch (e) {
                                                toast.error("Failed to update public roadmap");
                                            } finally {
                                                setSaving(false);
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Roadmap" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">-- None (Hidden) --</SelectItem>
                                            {roadmaps.map(r => (
                                                <SelectItem key={r.name} value={r.name}>{r.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
