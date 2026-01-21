"use client";

import React, { useEffect, useState } from "react";
import { Loader2, RefreshCw, Trash2, Plus, Edit, Bot, Eye, EyeOff, ExternalLink, GitPullRequest, Wand2 } from "lucide-react";
import { JulesInteractive } from "@/components/handson/JulesInteractive";
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
    triggerJules,
    getGlobalSettings,
    discoverRoadmapContext,
    generateOneRoadmapIdeas
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
    const [classifications, setClassifications] = useState<{ category: string, value: string }[]>([]);
    const [editingFeature, setEditingFeature] = useState<any>(null);
    const [featureTags, setFeatureTags] = useState<{ tag: string }[]>([]);
    const [featureTags, setFeatureTags] = useState<{ tag: string }[]>([]);
    const [isJulesDialogOpen, setIsJulesDialogOpen] = useState(false);
    const [julesFeature, setJulesFeature] = useState<any>(null);
    const [isAutoDiscovering, setIsAutoDiscovering] = useState(false);
    const [descriptionValue, setDescriptionValue] = useState("");

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
            const data = {
                title: formData.get("title"),
                description: descriptionValue,
                status: formData.get("status"),
                github_status: formData.get("github_status"),
                source_repository: formData.get("source_repo"),
                jules_api_key: formData.get("jules_api_key"),
                jules_api_key: formData.get("jules_api_key"),
                require_jules_approval: formData.get("require_jules_approval") === "on" ? 1 : 0,
                classifications: classifications
            };

            try {
                if(editingRoadmap) {
                    await updateRoadmap(editingRoadmap.name, data);
                    toast.success("Roadmap updated");
                } else {
                    await createRoadmap(data);
                    toast.success("Roadmap created");
                }
                // Auto-Trigger Discovery / Validation
                try {
                    const roadmapName = editingRoadmap ? editingRoadmap.name : data.title; // Best guess for ID, ideally API returns ID
                    // Note: We need the actual ID. If createRoadmap returns nothing, we might miss new ones.
                    // Assuming Create returns data or we rely on name=title for now (slugified)
                    // Safest is to rely on user refresh or just fire for update.
                    // For now, let's fire if we have a name (Edit) or just try with title (Create)
                    await discoverRoadmapContext(editingRoadmap ? editingRoadmap.name : data.title);
                    toast.success("Jules is validating your roadmap context in the background.");
                } catch {
                    // Ignore discovery errors, don't block save flow
                }

                setIsRoadmapDialogOpen(false);
                setEditingRoadmap(null);
                fetchData();
            } catch(error) {
                toast.error("Failed to save roadmap");
            }
        }

    }

    async function handleSaveFeature(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!selectedRoadmap) return;

        const formData = new FormData(e.currentTarget);
        const data = {
            roadmap: selectedRoadmap,
            feature: formData.get("feature"),
            description: formData.get("description"),
            status: formData.get("status"),
            priority: formData.get("priority"),
            type: formData.get("type"),
            tags: featureTags
        };

        try {
            if (editingFeature) {
                await updateRoadmapFeature(editingFeature.name, data);
                toast.success("Feature updated");
            } else {
                await createRoadmapFeature(data);
                toast.success("Feature created");
            }
            setIsFeatureDialogOpen(false);
            setEditingFeature(null);
            fetchFeatures(selectedRoadmap);
        } catch (error) {
            toast.error("Failed to save feature");
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
            async function handleSaveFeature(e: React.FormEvent<HTMLFormElement>) {
                e.preventDefault();
                if (!selectedRoadmap) return;

                const formData = new FormData(e.currentTarget);
                const data = {
                    roadmap: selectedRoadmap,
                    feature: formData.get("feature"),
                    description: formData.get("description"),
                    status: formData.get("status"),
                    priority: formData.get("priority"),
                    type: formData.get("type"),
                    tags: featureTags
                };

                try {
                    if (editingFeature) {
                        await updateRoadmapFeature(editingFeature.name, data);
                        toast.success("Feature updated");
                    } else {
                        await createRoadmapFeature(data);
                        toast.success("Feature created");
                    }
                    setIsFeatureDialogOpen(false);
                    setEditingFeature(null);
                    fetchFeatures(selectedRoadmap);
                } catch (error) {
                    toast.error("Failed to save feature");
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

            async function handleAutoDiscover() {
                if (!editingRoadmap?.name) {
                    toast.error("Please save the Roadmap with a Repo & Key first.");
                    return;
                }
                setIsAutoDiscovering(true);
                try {
                    const res = await discoverRoadmapContext(editingRoadmap.name);
                    toast.success(res.message || "Jules is analyzing your repo. Check back in a few minutes.");
                    setIsRoadmapDialogOpen(false); // Close so they can see the list/refresh later
                } catch (e: any) {
                    toast.error(e.message || "Discovery failed");
                } finally {
                    setIsAutoDiscovering(false);
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
        </div >
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
                                <DialogTrigger asChild>
                                    <Button onClick={() => {
                                        setEditingRoadmap(null);
                                        setClassifications([]);
                                        setDescriptionValue("");
                                        setIsRoadmapDialogOpen(true);
                                    }}>
                                        <Plus className="mr-2 h-4 w-4" /> New Roadmap
                                    </Button>
                                </DialogTrigger>
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

                                    <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium">Architecture & Context</h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setClassifications([...classifications, { category: "Platform", value: "" }])}
                                            >
                                                <Plus className="mr-2 h-3 w-3" /> Add Tag
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {classifications.map((item, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <Select
                                                        value={item.category}
                                                        onValueChange={(val) => {
                                                            const newItems = [...classifications];
                                                            newItems[idx].category = val;
                                                            setClassifications(newItems);
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-[140px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Platform">Platform</SelectItem>
                                                            <SelectItem value="Stack">Stack</SelectItem>
                                                            <SelectItem value="Dependency">Dependency</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        placeholder={item.category === "Dependency" ? "e.g. MariaDB" : (item.category === "Stack" ? "e.g. Flutter" : "e.g. iOS")}
                                                        value={item.value}
                                                        onChange={(e) => {
                                                            const newItems = [...classifications];
                                                            newItems[idx].value = e.target.value;
                                                            setClassifications(newItems);
                                                        }}
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-10 w-10 text-destructive hover:text-destructive"
                                                        onClick={() => setClassifications(classifications.filter((_, i) => i !== idx))}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {classifications.length === 0 && (
                                                <p className="text-xs text-muted-foreground italic text-center py-2">
                                                    Add tags like "Stack: Flutter" or "Dependency: Frappe" to help Jules understand your project.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="description">Description</Label>
                                </div>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={descriptionValue}
                                    onChange={(e) => setDescriptionValue(e.target.value)}
                                    placeholder="Project summary..."
                                />
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

                        <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" onClick={() => {
                                    setEditingFeature(null);
                                    setFeatureTags([]);
                                    setIsFeatureDialogOpen(true);
                                }}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Feature
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>{editingFeature ? "Edit Feature" : "New Feature"}</DialogTitle>
                                    <DialogDescription>Add a feature, bug, or idea to your roadmap.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSaveFeature} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="feature">Title</Label>
                                            <Input id="feature" name="feature" defaultValue={editingFeature?.feature} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select name="status" defaultValue={editingFeature?.status || "Ideas"}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Ideas">Ideas</SelectItem>
                                                    <SelectItem value="Idea Passed">Idea Passed</SelectItem>
                                                    <SelectItem value="Bugs">Bugs</SelectItem>
                                                    <SelectItem value="Doing">Doing</SelectItem>
                                                    <SelectItem value="Done">Done</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Type</Label>
                                            <Select name="type" defaultValue={editingFeature?.type || "Feature"}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Feature">Feature</SelectItem>
                                                    <SelectItem value="Bug">Bug</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="priority">Priority</Label>
                                            <Select name="priority" defaultValue={editingFeature?.priority || "Medium"}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Low">Low</SelectItem>
                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                    <SelectItem value="High">High</SelectItem>
                                                    <SelectItem value="Critical">Critical</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description (Prompt)</Label>
                                        <Textarea id="description" name="description" className="h-24" defaultValue={editingFeature?.description} placeholder="Describe the feature or bug..." />
                                    </div>

                                    {/* Feature Tags UI */}
                                    <div className="space-y-3 rounded-md border p-3 bg-muted/20">
                                        <Label className="text-xs font-semibold uppercase text-muted-foreground">Context Tags</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {["Frontend", "Backend", "UI", "Logic", "Database", "API", "Mobile", "Security"].map((tag) => {
                                                const isSelected = featureTags.some(t => t.tag === tag);
                                                return (
                                                    <Badge
                                                        key={tag}
                                                        variant={isSelected ? "default" : "outline"}
                                                        className="cursor-pointer select-none hover:bg-primary/80"
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setFeatureTags(featureTags.filter(t => t.tag !== tag));
                                                            } else {
                                                                setFeatureTags([...featureTags, { tag }]);
                                                            }
                                                        }}
                                                    >
                                                        {tag}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Add custom tag..."
                                                className="h-8 text-xs"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        const val = e.currentTarget.value.trim();
                                                        if (val && !featureTags.some(t => t.tag === val)) {
                                                            setFeatureTags([...featureTags, { tag: val }]);
                                                            e.currentTarget.value = "";
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {featureTags.filter(t => !["Frontend", "Backend", "UI", "Logic", "Database", "API", "Mobile", "Security"].includes(t.tag)).map((item, idx) => (
                                                <Badge key={idx} variant="secondary" className="gap-1 pr-1">
                                                    {item.tag}
                                                    <button type="button" onClick={() => setFeatureTags(featureTags.filter(t => t.tag !== item.tag))}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>


                                    {editingFeature?.jules_session_id && (
                                        <div className="space-y-2 pt-4 border-t">
                                            <Label className="text-sm font-semibold flex items-center gap-2">
                                                <Bot className="h-4 w-4" /> Jules Interactive Session
                                            </Label>
                                            <JulesInteractive
                                                sessionId={editingFeature.jules_session_id}
                                                apiKey={globalSettings?.jules_api_key || editingRoadmap?.jules_api_key}
                                                featureName={editingFeature.feature}
                                            />
                                        </div>
                                    )}

                                    <DialogFooter>
                                        <Button type="submit">{editingFeature ? "Update" : "Create"}</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
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
                        </Table>
                        {features.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-12 space-y-4 border rounded-lg border-dashed mt-4 bg-muted/10">
                                <div className="rounded-full bg-blue-100 p-3">
                                    <Wand2 className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-medium">No Features Yet</h3>
                                <p className="text-center text-sm text-muted-foreground max-w-sm">
                                    Your roadmap is empty. You can add features manually or let Jules brainstorm ideas based on your architecture.
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => {
                                        setEditingFeature(null);
                                        setFeatureTags([]);
                                        setIsFeatureDialogOpen(true);
                                    }}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Manually
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            if (!selectedRoadmap) return;
                                            setIsJulesRunning(true);
                                            try {
                                                await generateOneRoadmapIdeas(selectedRoadmap);
                                                toast.success("Jules is brainstorming! Check back in a few minutes.");
                                            } catch (e) {
                                                toast.error("Failed to start idea generation");
                                            } finally {
                                                setIsJulesRunning(false);
                                            }
                                        }}
                                        disabled={isJulesRunning}
                                    >
                                        {isJulesRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                                        Generate Ideas
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

        {/* Roadmaps List Tab Content */ }
            </Tabs >

            {/* Jules Assign Dialog */ }
            < Dialog open = { isJulesDialogOpen } onOpenChange = { setIsJulesDialogOpen } >
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
        </Dialog >
        </div >
    );
    }
