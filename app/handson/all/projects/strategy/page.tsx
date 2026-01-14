"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, ChevronRight, LayoutDashboard, Target, Flag, Activity } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { getPlanOnAPage, updatePlanOnAPage } from "@/app/actions/handson/all/projects/strategy/plan";
import { getVisions, createVision, updateVision, deleteVision, getVision } from "@/app/actions/handson/all/projects/strategy/vision";
import { getPillars, createPillar, updatePillar, deletePillar } from "@/app/actions/handson/all/projects/strategy/pillar";
import { getStrategicObjectives, createStrategicObjective, updateStrategicObjective, deleteStrategicObjective } from "@/app/actions/handson/all/projects/strategy/objective";
import { getKPIs, createKPI, updateKPI, deleteKPI } from "@/app/actions/handson/all/projects/strategy/kpi";
import { getPersonalMasteryGoals, createPersonalMasteryGoal, updatePersonalMasteryGoal, deletePersonalMasteryGoal } from "@/app/actions/handson/all/projects/strategy/mastery";
import { Badge } from "@/components/ui/badge";

// --- Schemas ---

const commonSchema = z.object({
    title: z.string().min(2, "Title is required"),
    description: z.string().optional()
});

const relationshipSchema = commonSchema.extend({
    parentLink: z.string().min(1, "Parent link is required")
});

export default function StrategyPage() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [loading, setLoading] = useState(true);

    // Data State
    const [planOnAPage, setPlanOnAPage] = useState<any>(null);
    const [visions, setVisions] = useState<any[]>([]);
    const [pillars, setPillars] = useState<any[]>([]);
    const [objectives, setObjectives] = useState<any[]>([]);
    const [kpis, setKpis] = useState<any[]>([]);
    const [goals, setGoals] = useState<any[]>([]);

    // Dialog State
    const [dialogType, setDialogType] = useState<"Vision" | "Pillar" | "Objective" | "KPI" | "Goal" | null>(null);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    // Forms
    const form = useForm<any>({
        resolver: zodResolver(dialogType === "Vision" || dialogType === "Goal" ? commonSchema : relationshipSchema),
        defaultValues: { title: "", description: "", parentLink: "" }
    });

    async function fetchData() {
        setLoading(true);
        try {
            const [poapData, visData, pilData, objData, kpiData, goalData] = await Promise.all([
                getPlanOnAPage(),
                getVisions(),
                getPillars(),
                getStrategicObjectives(),
                getKPIs(),
                getPersonalMasteryGoals()
            ]);
            setPlanOnAPage(poapData);
            setVisions(visData || []);
            setPillars(pilData || []);
            setObjectives(objData || []);
            setKpis(kpiData || []);
            setGoals(goalData || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load strategy data");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    // --- Actions ---

    const openDialog = (type: "Vision" | "Pillar" | "Objective" | "KPI" | "Goal", item?: any, parentId?: string) => {
        setDialogType(type);
        setEditingItem(item);
        form.reset({
            title: item?.title || "",
            description: item?.description || "",
            parentLink: item?.vision || item?.pillar || item?.strategic_objective || parentId || ""
        });
    };

    const closeDialog = () => {
        setDialogType(null);
        setEditingItem(null);
    };

    const onSubmit = async (values: any) => {
        try {
            if (dialogType === "Vision") {
                editingItem ? await updateVision(editingItem.name, values) : await createVision(values);
            } else if (dialogType === "Pillar") {
                const data = { ...values, vision: values.parentLink };
                editingItem ? await updatePillar(editingItem.name, data) : await createPillar(data);
            } else if (dialogType === "Objective") {
                const data = { ...values, pillar: values.parentLink };
                editingItem ? await updateStrategicObjective(editingItem.name, data) : await createStrategicObjective(data);
            } else if (dialogType === "KPI") {
                const data = { ...values, strategic_objective: values.parentLink };
                editingItem ? await updateKPI(editingItem.name, data) : await createKPI(data);
            } else if (dialogType === "Goal") {
                editingItem ? await updatePersonalMasteryGoal(editingItem.name, values) : await createPersonalMasteryGoal(values);
            }
            toast.success(`${dialogType} saved`);
            closeDialog();
            fetchData();
        } catch (error) {
            toast.error("Failed to save");
        }
    };

    const onDelete = async (type: string, name: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            if (type === "Vision") await deleteVision(name);
            if (type === "Pillar") await deletePillar(name);
            if (type === "Objective") await deleteStrategicObjective(name);
            if (type === "KPI") await deleteKPI(name);
            if (type === "Goal") await deletePersonalMasteryGoal(name);
            toast.success("Deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const setMainVision = async (visionName: string) => {
        try {
            await updatePlanOnAPage({ vision: visionName });
            toast.success("Active Vision Updated");
            fetchData();
        } catch (error) {
            toast.error("Failed to update active vision");
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // --- Helper to build the hierarchy tree ---
    const activeVisionId = planOnAPage?.vision;
    const activeVision = visions.find(v => v.name === activeVisionId);

    // Grouping
    const getPillarsForVision = (vid: string) => pillars.filter(p => p.vision === vid);
    const getObjsForPillar = (pid: string) => objectives.filter(o => o.pillar === pid);
    const getKpisForObj = (oid: string) => kpis.filter(k => k.strategic_objective === oid);

    return (
        <div className="space-y-8 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Strategy & Execution</h1>
                    <p className="text-muted-foreground">Manage Vision, Pillars, Objectives, and KPIs.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={activeVisionId || ""} onValueChange={setMainVision}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select Active Vision" />
                        </SelectTrigger>
                        <SelectContent>
                            {visions.map((v) => (
                                <SelectItem key={v.name} value={v.name}>{v.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => openDialog("Vision")}>Create Vision</Button>
                </div>
            </div>

            <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="dashboard">Plan on a Page</TabsTrigger>
                    <TabsTrigger value="manage">Manage Entities</TabsTrigger>
                    <TabsTrigger value="goals">Personal Mastery</TabsTrigger>
                </TabsList>

                {/* --- Dashboard Tab --- */}
                <TabsContent value="dashboard" className="space-y-6 mt-6">
                    {activeVision ? (
                        <div className="space-y-8">
                            {/* Vision Header */}
                            <div className="text-center space-y-4 p-8 bg-primary/5 rounded-lg border border-primary/20">
                                <Badge variant="outline" className="mb-2">Active Vision</Badge>
                                <h2 className="text-4xl font-extrabold tracking-tight text-primary">{activeVision.title}</h2>
                                <div className="text-lg text-muted-foreground max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: activeVision.description }} />
                            </div>

                            {/* Pillars Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {getPillarsForVision(activeVision.name).map((pillar) => (
                                    <Card key={pillar.name} className="flex flex-col h-full border-t-4 border-t-blue-500 shadow-sm">
                                        <CardHeader>
                                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                                <LayoutDashboard className="h-4 w-4" />
                                                <span className="text-xs font-semibold uppercase tracking-wider">Strategic Pillar</span>
                                            </div>
                                            <CardTitle className="text-xl">{pillar.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1 space-y-6">
                                            {getObjsForPillar(pillar.name).length > 0 ? (
                                                getObjsForPillar(pillar.name).map((obj) => (
                                                    <div key={obj.name} className="space-y-3">
                                                        <div className="flex items-start gap-2">
                                                            <Target className="h-4 w-4 mt-1 text-orange-500 shrink-0" />
                                                            <div>
                                                                <h4 className="font-semibold text-sm leading-tight">{obj.title}</h4>
                                                                {/* KPIs */}
                                                                <div className="mt-2 pl-2 border-l-2 border-muted space-y-2">
                                                                    {getKpisForObj(obj.name).map((kpi) => (
                                                                        <div key={kpi.name} className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-1.5 rounded">
                                                                            <Activity className="h-3 w-3 text-green-600" />
                                                                            <span>{kpi.title}</span>
                                                                        </div>
                                                                    ))}
                                                                    {getKpisForObj(obj.name).length === 0 && (
                                                                        <span className="text-xs text-muted-foreground italic pl-1">No KPIs defined</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-muted-foreground italic text-center py-4">No Strategic Objectives</div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                                {getPillarsForVision(activeVision.name).length === 0 && (
                                    <div className="col-span-full text-center py-12 text-muted-foreground">
                                        No Pillars defined for this Vision. Switch to the "Manage Entities" tab to add them.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-muted/10 rounded-lg border border-dashed">
                            <h3 className="text-lg font-medium">No Active Vision Selected</h3>
                            <p className="text-muted-foreground mb-4">Select a vision from the dropdown or create a new one.</p>
                            <Button onClick={() => openDialog("Vision")}>Create Vision</Button>
                        </div>
                    )}
                </TabsContent>

                {/* --- Goals Tab --- */}
                <TabsContent value="goals" className="space-y-6 mt-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-semibold">Personal Mastery Goals</h3>
                            <p className="text-muted-foreground">Define and track individual growth objectives.</p>
                        </div>
                        <Button onClick={() => openDialog("Goal")}><Plus className="mr-2 h-4 w-4" /> New Goal</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {goals.map((goal) => (
                            <Card key={goal.name}>
                                <CardHeader>
                                    <CardTitle>{goal.title}</CardTitle>
                                    <CardDescription dangerouslySetInnerHTML={{ __html: goal.description }} />
                                </CardHeader>
                                <CardContent className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => openDialog("Goal", goal)}>
                                        <Pencil className="h-4 w-4 mr-2" /> Edit
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => onDelete("Goal", goal.name)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                        {goals.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                No Personal Mastery Goals defined yet.
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* --- Manage Tab --- */}
                <TabsContent value="manage" className="space-y-6 mt-6">
                    <Accordion type="single" collapsible className="w-full">
                        {visions.map((vision) => (
                            <AccordionItem key={vision.name} value={vision.name}>
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-2">
                                            <Flag className="h-4 w-4 text-primary" />
                                            <span className="font-semibold text-lg">{vision.title}</span>
                                            {activeVisionId === vision.name && <Badge>Active</Badge>}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="bg-muted/5 p-4 rounded-b-lg border-x border-b">
                                    <div className="flex justify-end gap-2 mb-4">
                                        <Button size="sm" variant="outline" onClick={() => openDialog("Vision", vision)}><Pencil className="h-3 w-3 mr-1" /> Edit Vision</Button>
                                        <Button size="sm" variant="outline" onClick={() => openDialog("Pillar", null, vision.name)}><Plus className="h-3 w-3 mr-1" /> Add Pillar</Button>
                                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => onDelete("Vision", vision.name)}><Trash2 className="h-3 w-3" /></Button>
                                    </div>

                                    <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                                        {getPillarsForVision(vision.name).map((pillar) => (
                                            <div key={pillar.name} className="bg-background border rounded-md p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <LayoutDashboard className="h-4 w-4 text-blue-500" />
                                                        <span className="font-semibold">{pillar.title}</span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openDialog("Pillar", pillar)}><Pencil className="h-3 w-3" /></Button>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => onDelete("Pillar", pillar.name)}><Trash2 className="h-3 w-3" /></Button>
                                                        <Button size="sm" variant="secondary" className="h-6 text-xs ml-2" onClick={() => openDialog("Objective", null, pillar.name)}>+ Objective</Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 pl-4 border-l-2 border-blue-200 mt-2">
                                                    {getObjsForPillar(pillar.name).map((obj) => (
                                                        <div key={obj.name} className="bg-muted/20 rounded p-2">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Target className="h-3 w-3 text-orange-500" />
                                                                    <span className="text-sm font-medium">{obj.title}</span>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => openDialog("Objective", obj, pillar.name)}><Pencil className="h-3 w-3" /></Button>
                                                                    <Button size="icon" variant="ghost" className="h-5 w-5 text-red-500" onClick={() => onDelete("Objective", obj.name)}><Trash2 className="h-3 w-3" /></Button>
                                                                    <Button size="sm" variant="outline" className="h-5 text-[10px] px-1 ml-1" onClick={() => openDialog("KPI", null, obj.name)}>+ KPI</Button>
                                                                </div>
                                                            </div>

                                                            <div className="pl-6 mt-1 space-y-1">
                                                                {getKpisForObj(obj.name).map((kpi) => (
                                                                    <div key={kpi.name} className="flex items-center justify-between text-xs text-muted-foreground hover:bg-muted/50 rounded px-1">
                                                                        <div className="flex items-center gap-1">
                                                                            <Activity className="h-3 w-3 text-green-500" />
                                                                            <span>{kpi.title}</span>
                                                                        </div>
                                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <Button size="icon" variant="ghost" className="h-4 w-4" onClick={() => openDialog("KPI", kpi, obj.name)}><Pencil className="h-2 w-2" /></Button>
                                                                            <Button size="icon" variant="ghost" className="h-4 w-4 text-red-500" onClick={() => onDelete("KPI", kpi.name)}><Trash2 className="h-2 w-2" /></Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </TabsContent>
            </Tabs>

            {/* --- Generic Dialog --- */}
            <Dialog open={!!dialogType} onOpenChange={() => closeDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit" : "Create"} {dialogType}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Textarea {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {dialogType !== "Vision" && dialogType !== "Goal" && (
                                <FormField control={form.control} name="parentLink" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {dialogType === "Pillar" ? "Vision" :
                                                dialogType === "Objective" ? "Pillar" :
                                                    "Strategic Objective"}
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Parent" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {dialogType === "Pillar" && visions.map(v => <SelectItem key={v.name} value={v.name}>{v.title}</SelectItem>)}
                                                {dialogType === "Objective" && pillars.map(p => <SelectItem key={p.name} value={p.name}>{p.title}</SelectItem>)}
                                                {dialogType === "KPI" && objectives.map(o => <SelectItem key={o.name} value={o.name}>{o.title}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            )}

                            <DialogFooter>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
