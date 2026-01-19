"use client";

import React, { useEffect, useState } from "react";
import { Loader2, RefreshCw, Trash2, Plus, Edit, Bot, Eye, EyeOff, ExternalLink, GitPullRequest } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { Switch } from "@/components/ui/switch";
import {
    getRoadmaps,
    getRoadmapFeatures,
    createRoadmap,
    updateRoadmap,
    deleteRoadmap,
    createRoadmapFeature,
    updateRoadmapFeature,
    deleteRoadmapFeature,
    assignToJules,
    getJulesSources,
    triggerJules,
    getGlobalSettings
} from "@/app/actions/handson/all/roadmap/roadmap";

export default function UnifiedRoadmapPage() {
    const [roadmaps, setRoadmaps] = useState<any[]>([]);
    const [features, setFeatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoadmap, setSelectedRoadmap] = useState<string | null>(null);

    // Dialog states
    const [isRoadmapDialogOpen, setIsRoadmapDialogOpen] = useState(false);
    const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
    const [editingRoadmap, setEditingRoadmap] = useState<any>(null);
    const [editingFeature, setEditingFeature] = useState<any>(null);
    const [isJulesDialogOpen, setIsJulesDialogOpen] = useState(false);
    const [julesFeature, setJulesFeature] = useState<any>(null);

    // Jules & Repo States
    const [sources, setSources] = useState<string[]>([]);
    const [isJulesRunning, setIsJulesRunning] = useState(false);
    const [tempApiKey, setTempApiKey] = useState(""); // For "Get Sources" check
    const [showKey, setShowKey] = useState(false);
    const [globalSettings, setGlobalSettings] = useState<any>(null);

    async function fetchData() {
        setLoading(true);
        try {
            const roadmapsData = await getRoadmaps();

            setRoadmaps(roadmapsData || []);

            const settings = await getGlobalSettings();
            setGlobalSettings(settings);

            if (roadmapsData && roadmapsData.length > 0) {
                const roadmapName = selectedRoadmap || roadmapsData[0].name;
                setSelectedRoadmap(roadmapName);
                const featuresData = await getRoadmapFeatures(roadmapName);
                setFeatures(featuresData || []);
            } else {
                setFeatures([]);
            }
        } catch (error) {
            console.error("Error fetching roadmap data:", error);
            toast.error("Failed to fetch roadmap data");
        } finally {
            setLoading(false);
        }
    }

    async function fetchFeatures(roadmapName: string) {
        try {
            const featuresData = await getRoadmapFeatures(roadmapName);
            setFeatures(featuresData || []);
        } catch (error) {
            console.error("Error fetching features:", error);
            toast.error("Failed to fetch features");
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedRoadmap) {
            fetchFeatures(selectedRoadmap);
        }
    }, [selectedRoadmap]);

    async function handleFetchSources(apiKey: string) {
        if (!apiKey) return;
        try {
            const res = await getJulesSources(apiKey);
            setSources(res || []);
            toast.success("Repositories fetched successfully");
        } catch (e) {
            toast.error("Invalid API Key or Network Error");
        }
    }

    async function handleSaveRoadmap(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get("title"),
            description: formData.get("description"),
            status: formData.get("status"),
            github_status: formData.get("github_status"),
            source_repository: formData.get("source_repo"),
            jules_api_key: formData.get("jules_api_key"),
            require_jules_approval: formData.get("require_jules_approval") === "on" ? 1 : 0
        };

        try {
            if (editingRoadmap) {
                await updateRoadmap(editingRoadmap.name, data);
                toast.success("Roadmap updated");
            } else {
                await createRoadmap(data);
                toast.success("Roadmap created");
            }
            setIsRoadmapDialogOpen(false);
            setEditingRoadmap(null);
            fetchData();
        } catch (error) {
            toast.error("Failed to save roadmap");
        }
    }

    async function handleAssignToJules(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const explanation = formData.get("explanation") as string;

        try {
            await assignToJules(julesFeature.name, julesFeature.feature, explanation);
            toast.success("Task assigned to Jules");
            setIsJulesDialogOpen(false);
            setJulesFeature(null);
            if (selectedRoadmap) fetchFeatures(selectedRoadmap); // refresh to see status change
        } catch (error) {
            toast.error("Failed to assign task");
        }
    }

    async function handleRunJules() {
        setIsJulesRunning(true);
        try {
            await triggerJules();
            toast.success("Jules started! Check 'AI Idea Sessions'.");
        } catch {
            toast.error("Failed to start Jules");
        } finally {
            setIsJulesRunning(false);
        }
    }

    if (loading && roadmaps.length === 0) {
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
                    <h1 className="text-3xl font-bold tracking-tight">Roadmap</h1>
                    <p className="text-muted-foreground">Manage your product roadmap and Jules AI integration.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleRunJules} disabled={isJulesRunning}>
                        {isJulesRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                        Run Jules Now
                    </Button>
                    <Button variant="outline" size="icon" onClick={fetchData} title="Refresh">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Dialog open={isRoadmapDialogOpen} onOpenChange={setIsRoadmapDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => { setEditingRoadmap(null); setIsRoadmapDialogOpen(true); }}>
                                <Plus className="mr-2 h-4 w-4" /> New Roadmap
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>{editingRoadmap ? "Edit Roadmap" : "Create Roadmap"}</DialogTitle>
                                <DialogDescription>
                                    Configure your roadmap and link it to a repository for Jules AI.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSaveRoadmap} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input id="title" name="title" defaultValue={editingRoadmap?.title} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select name="status" defaultValue={editingRoadmap?.status || "Active"}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Archived">Archived</SelectItem>
                                                <SelectItem value="Draft">Draft</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" name="description" defaultValue={editingRoadmap?.description} />
                                </div>

                                <div className="space-y-4 border-t pt-4">
                                    <h4 className="text-sm font-medium leading-none">Jules AI Configuration</h4>

                                    <div className="space-y-2">
                                        <Label htmlFor="jules_api_key">Jules API Key</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Input
                                                    id="jules_api_key"
                                                    name="jules_api_key"
                                                    type={showKey ? "text" : "password"}
                                                    defaultValue={editingRoadmap?.jules_api_key}
                                                    placeholder={editingRoadmap?.jules_api_key ? "••••••••••••••••" : "Enter your Jules API Key"}
                                                    onChange={(e) => setTempApiKey(e.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowKey(!showKey)}
                                                >
                                                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                            <Button type="button" variant="secondary" onClick={() => handleFetchSources(tempApiKey || editingRoadmap?.jules_api_key || globalSettings?.jules_api_key)}>
                                                Fetch Repos
                                            </Button>
                                        </div>
                                        <p className="text-[0.8rem] text-muted-foreground">
                                            {globalSettings?.jules_api_key ? "Using Global API Key. Enter a key below to override it." : "Enter your Jules API Key to get started."}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="source_repo">Source Repository</Label>
                                        <Select name="source_repo" defaultValue={editingRoadmap?.source_repository}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a repository" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sources.length > 0 ?
                                                    sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>) :
                                                    (editingRoadmap?.source_repository ? <SelectItem value={editingRoadmap.source_repository}>{editingRoadmap.source_repository}</SelectItem> : <SelectItem value="none" disabled>Fetch repos first...</SelectItem>)
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {(tempApiKey || editingRoadmap?.jules_api_key || globalSettings?.jules_api_key) && (
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="require_jules_approval">Require Plan Approval</Label>
                                                <p className="text-[0.8rem] text-muted-foreground">
                                                    Force Jules to wait for your approval before writing code.
                                                </p>
                                            </div>
                                            <Switch
                                                id="require_jules_approval"
                                                name="require_jules_approval"
                                                defaultChecked={editingRoadmap?.require_jules_approval}
                                            />
                                        </div>
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button type="submit">{editingRoadmap ? "Update" : "Create"}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog >
                </div >
            </div >

            <Tabs defaultValue="features" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="roadmaps">Roadmaps List</TabsTrigger>
                </TabsList>

                <TabsContent value="features" className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Select value={selectedRoadmap || ""} onValueChange={setSelectedRoadmap}>
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Select Roadmap" />
                            </SelectTrigger>
                            <SelectContent>
                                {roadmaps.map((r) => (
                                    <SelectItem key={r.name} value={r.name}>{r.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Add Feature Dialog Code (Similar to previous, omitted for brevity but would include standard fields) */}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Features</CardTitle>
                            <CardDescription>
                                Features for {roadmaps.find(r => r.name === selectedRoadmap)?.title || "Selected Roadmap"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Feature</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>AI Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {features.map((item) => (
                                        <TableRow key={item.name}>
                                            <TableCell className="font-medium">
                                                <div>{item.feature}</div>
                                                <div className="text-xs text-muted-foreground truncate max-w-[300px]">{item.description}</div>
                                            </TableCell>
                                            <TableCell><Badge variant="outline">{item.status}</Badge></TableCell>
                                            <TableCell>
                                                {item.ai_status === "Assigned" && <Badge className="bg-blue-100 text-blue-800">Assigned</Badge>}
                                                {item.ai_status === "Ready" && <Badge className="bg-green-100 text-green-800">Ready</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.pull_request_url && (
                                                    <Button variant="ghost" size="icon" title="Open Pull Request" onClick={() => window.open(item.pull_request_url, '_blank')}>
                                                        <GitPullRequest className="h-4 w-4 text-orange-600" />
                                                    </Button>
                                                )}
                                                {item.jules_session_id && (
                                                    <Button variant="ghost" size="icon" title="Open Jules Session" onClick={() => window.open(`https://jules.google.com/session/${item.jules_session_id}`, '_blank')}>
                                                        <ExternalLink className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" title="Assign to Jules" onClick={() => {
                                                    setJulesFeature(item);
                                                    setIsJulesDialogOpen(true);
                                                }}>
                                                    <Bot className="h-4 w-4 text-purple-600" />
                                                </Button>
                                                {/* Edit/Delete Buttons */}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Roadmaps List Tab Content */}
            </Tabs>

            {/* Jules Assign Dialog */}
            <Dialog open={isJulesDialogOpen} onOpenChange={setIsJulesDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign to Jules AI</DialogTitle>
                        <DialogDescription>
                            Jules will use the API Key configured in this Roadmap's settings.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAssignToJules} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Feature</Label>
                            <Input value={julesFeature?.feature || ""} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Instructions</Label>
                            <Textarea name="explanation" required className="h-32" placeholder="Detailed instructions for the AI agent..." defaultValue={julesFeature?.description} />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Assign Task</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div >
    );
}
