"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Trash2, Plus, Edit } from "lucide-react";
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
    getRoadmaps,
    getRoadmapFeatures,
    createRoadmap,
    updateRoadmap,
    deleteRoadmap,
    createRoadmapFeature,
    updateRoadmapFeature,
    deleteRoadmapFeature
} from "@/app/actions/handson/control/roadmap/roadmap";

export default function RoadmapPage() {
    const [roadmaps, setRoadmaps] = useState<any[]>([]);
    const [features, setFeatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoadmap, setSelectedRoadmap] = useState<string | null>(null);

    // Dialog states
    const [isRoadmapDialogOpen, setIsRoadmapDialogOpen] = useState(false);
    const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
    const [editingRoadmap, setEditingRoadmap] = useState<any>(null);
    const [editingFeature, setEditingFeature] = useState<any>(null);

    async function fetchData() {
        setLoading(true);
        try {
            const roadmapsData = await getRoadmaps();
            setRoadmaps(roadmapsData || []);

            if (roadmapsData && roadmapsData.length > 0) {
                // Default to first roadmap or keep selected
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

    async function handleSaveRoadmap(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get("title"),
            description: formData.get("description"),
            status: formData.get("status"),
            github_status: formData.get("github_status"),
            source_repository: formData.get("source_repository"),
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

    async function handleDeleteRoadmap(name: string) {
        if (!confirm("Are you sure you want to delete this roadmap?")) return;
        try {
            await deleteRoadmap(name);
            toast.success("Roadmap deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete roadmap");
        }
    }

    async function handleSaveFeature(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            feature: formData.get("feature"),
            description: formData.get("description"),
            status: formData.get("status"),
            priority: formData.get("priority"),
            roadmap: selectedRoadmap,
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
            if (selectedRoadmap) fetchFeatures(selectedRoadmap);
        } catch (error) {
            toast.error("Failed to save feature");
        }
    }

    async function handleDeleteFeature(name: string) {
        if (!confirm("Are you sure you want to delete this feature?")) return;
        try {
            await deleteRoadmapFeature(name);
            toast.success("Feature deleted");
            if (selectedRoadmap) fetchFeatures(selectedRoadmap);
        } catch (error) {
            toast.error("Failed to delete feature");
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
                    <h1 className="text-3xl font-bold">Roadmap Management</h1>
                    <p className="text-muted-foreground">Manage product roadmaps and features.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={fetchData} title="Refresh">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Dialog open={isRoadmapDialogOpen} onOpenChange={setIsRoadmapDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setEditingRoadmap(null)}>
                                <Plus className="mr-2 h-4 w-4" /> New Roadmap
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingRoadmap ? "Edit Roadmap" : "Create Roadmap"}</DialogTitle>
                                <DialogDescription>
                                    {editingRoadmap ? "Update existing roadmap details." : "Add a new roadmap to track features."}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSaveRoadmap} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title" name="title" defaultValue={editingRoadmap?.title} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" name="description" defaultValue={editingRoadmap?.description} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select name="status" defaultValue={editingRoadmap?.status || "Active"}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Archived">Archived</SelectItem>
                                                <SelectItem value="Draft">Draft</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="github_status">GitHub Status</Label>
                                        <Select name="github_status" defaultValue={editingRoadmap?.github_status || "Not Connected"}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Not Connected">Not Connected</SelectItem>
                                                <SelectItem value="Connected">Connected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="source_repository">Source Repository</Label>
                                    <Input id="source_repository" name="source_repository" defaultValue={editingRoadmap?.source_repository} placeholder="owner/repo" />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Save</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

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
                                <Button disabled={!selectedRoadmap} onClick={() => setEditingFeature(null)}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Feature
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingFeature ? "Edit Feature" : "Add Feature"}</DialogTitle>
                                    <DialogDescription>Add a feature to the roadmap.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSaveFeature} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="feature">Feature Name</Label>
                                        <Input id="feature" name="feature" defaultValue={editingFeature?.feature} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea id="description" name="description" defaultValue={editingFeature?.description} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select name="status" defaultValue={editingFeature?.status || "Backlog"}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Backlog">Backlog</SelectItem>
                                                    <SelectItem value="Planned">Planned</SelectItem>
                                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                                    <SelectItem value="Completed">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="priority">Priority</Label>
                                            <Select name="priority" defaultValue={editingFeature?.priority || "Medium"}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="High">High</SelectItem>
                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                    <SelectItem value="Low">Low</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Save</Button>
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
                                        <TableHead>Priority</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {features.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No features found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        features.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">
                                                    <div>{item.feature}</div>
                                                    <div className="text-xs text-muted-foreground truncate max-w-[300px]">{item.description}</div>
                                                </TableCell>
                                                <TableCell>{item.status}</TableCell>
                                                <TableCell>{item.priority}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                        setEditingFeature(item);
                                                        setIsFeatureDialogOpen(true);
                                                    }}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteFeature(item.name)}>
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

                <TabsContent value="roadmaps" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Roadmaps</CardTitle>
                            <CardDescription>Manage your product roadmaps.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>GitHub</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roadmaps.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No roadmaps found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        roadmaps.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.title}</TableCell>
                                                <TableCell>{item.status}</TableCell>
                                                <TableCell>{item.github_status}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                        setEditingRoadmap(item);
                                                        setIsRoadmapDialogOpen(true);
                                                    }}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteRoadmap(item.name)}>
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
            </Tabs>
        </div>
    );
}
