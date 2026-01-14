"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
    getTenderControlSettings,
    getGeneratedTenderTasks,
    getTenderWorkflowTasks,
    getTenderWorkflowTemplates,
    getIntelligentTaskSets,
    deleteGeneratedTenderTask,
    deleteTenderWorkflowTask,
    deleteTenderWorkflowTemplate,
    deleteIntelligentTaskSet
} from "@/app/actions/handson/control/tender/tender";

export default function TenderPage() {
    const [settings, setSettings] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [workflowTasks, setWorkflowTasks] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [taskSets, setTaskSets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchData() {
        setLoading(true);
        try {
            const [settingsData, tasksData, wfTasksData, templatesData, setsData] = await Promise.all([
                getTenderControlSettings(),
                getGeneratedTenderTasks(),
                getTenderWorkflowTasks(),
                getTenderWorkflowTemplates(),
                getIntelligentTaskSets()
            ]);
            setSettings(settingsData || []);
            setTasks(tasksData || []);
            setWorkflowTasks(wfTasksData || []);
            setTemplates(templatesData || []);
            setTaskSets(setsData || []);
        } catch (error) {
            console.error("Error fetching tender data:", error);
            toast.error("Failed to fetch tender data");
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteTask(name: string) {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteGeneratedTenderTask(name);
            toast.success("Task deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete task");
        }
    }

    async function handleDeleteWorkflowTask(name: string) {
        if (!confirm("Are you sure you want to delete this workflow task?")) return;
        try {
            await deleteTenderWorkflowTask(name);
            toast.success("Workflow task deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete workflow task");
        }
    }

    async function handleDeleteTemplate(name: string) {
        if (!confirm("Are you sure you want to delete this template?")) return;
        try {
            await deleteTenderWorkflowTemplate(name);
            toast.success("Template deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete template");
        }
    }

    async function handleDeleteTaskSet(name: string) {
        if (!confirm("Are you sure you want to delete this task set?")) return;
        try {
            await deleteIntelligentTaskSet(name);
            toast.success("Task set deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete task set");
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
                    <h1 className="text-3xl font-bold">Tender & Tasks Management</h1>
                    <p className="text-muted-foreground">Control tender workflows, tasks, and settings.</p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchData} title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            <Tabs defaultValue="settings">
                <TabsList className="flex-wrap h-auto">
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="tasks">Generated Tasks</TabsTrigger>
                    <TabsTrigger value="workflow-tasks">Workflow Tasks</TabsTrigger>
                    <TabsTrigger value="templates">Workflow Templates</TabsTrigger>
                    <TabsTrigger value="intelligent-sets">Intelligent Task Sets</TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tender Control Settings</CardTitle>
                            <CardDescription>Global tender configuration.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Default Workflow</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {settings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                                                No settings found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        settings.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.default_workflow}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tasks" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Generated Tender Tasks</CardTitle>
                            <CardDescription>Tasks generated from tenders.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Tender</TableHead>
                                        <TableHead>Task Name</TableHead>
                                        <TableHead>Task Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tasks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No tasks found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        tasks.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.tender}</TableCell>
                                                <TableCell>{item.task_name}</TableCell>
                                                <TableCell>{item.status}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteTask(item.name)}>
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

                <TabsContent value="workflow-tasks" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tender Workflow Tasks</CardTitle>
                            <CardDescription>Individual tasks within workflows.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Workflow</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Assigned To</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workflowTasks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No workflow tasks found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        workflowTasks.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.workflow}</TableCell>
                                                <TableCell>{item.task_description}</TableCell>
                                                <TableCell>{item.assigned_to}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteWorkflowTask(item.name)}>
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

                <TabsContent value="templates" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tender Workflow Templates</CardTitle>
                            <CardDescription>Templates for tender workflows.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Template Name</TableHead>
                                        <TableHead>Template Name</TableHead>
                                        <TableHead>Created By</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {templates.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                No templates found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        templates.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.template_name}</TableCell>
                                                <TableCell>{item.created_by}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteTemplate(item.name)}>
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

                <TabsContent value="intelligent-sets" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Intelligent Task Sets</CardTitle>
                            <CardDescription>Sets of intelligent tasks.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Set Name</TableHead>
                                        <TableHead>Set Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {taskSets.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                No task sets found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        taskSets.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.set_name}</TableCell>
                                                <TableCell>{item.description}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteTaskSet(item.name)}>
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
