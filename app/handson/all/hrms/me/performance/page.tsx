"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Target, Award, Plus, Calendar, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { getGoals, getAppraisals, saveGoal, submitAppraisal } from "@/app/actions/handson/all/hrms/me/performance";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";
import { verifyHrRole } from "@/app/lib/roles";

export default function PerformancePage() {
    const [goals, setGoals] = useState<any[]>([]);
    const [appraisals, setAppraisals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState<any[]>([]);
    const [canEdit, setCanEdit] = useState(false);

    // Dialog State
    const [isGoalOpen, setIsGoalOpen] = useState(false);
    const [newGoal, setNewGoal] = useState({ goal: "", progress: 0, status: "Open" });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [g, a, e] = await Promise.all([
                getGoals(),
                getAppraisals(),
                getEmployees()
            ]);
            setGoals(g);
            setAppraisals(a);
            setEmployees(e);
            const role = await verifyHrRole();
            setCanEdit(role);
        } catch (error) {
            toast.error("Failed to load performance data");
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveGoal() {
        if (!newGoal.goal) return toast.error("Goal description required");
        try {
            await saveGoal(newGoal);
            toast.success("Goal Created");
            setIsGoalOpen(false);
            loadData();
        } catch (e) {
            toast.error("Failed to save goal");
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Target className="h-8 w-8" /> Performance & Goals
                </h1>
                <p className="text-muted-foreground">Track employee targets and appraisals.</p>
            </div>

            <Tabs defaultValue="goals" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="goals">My Goals</TabsTrigger>
                    <TabsTrigger value="appraisals">Appraisals</TabsTrigger>
                </TabsList>

                <TabsContent value="goals" className="space-y-4">
                    <div className="flex justify-end">
                        {canEdit && (
                            <Button onClick={() => setIsGoalOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> New Goal
                            </Button>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {goals.length === 0 && !loading && (
                            <div className="col-span-full text-center p-8 text-muted-foreground border rounded-lg border-dashed">
                                No active goals found. Set a target to get started.
                            </div>
                        )}
                        {goals.map((goal) => (
                            <Card key={goal.name}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant={goal.status === "Completed" ? "default" : "secondary"}>
                                            {goal.status}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center">
                                            <Calendar className="mr-1 h-3 w-3" /> {goal.end_date || "No Deadline"}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg mt-2">{goal.goal}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Progress</span>
                                            <span>{goal.progress || 0}%</span>
                                        </div>
                                        <Progress value={goal.progress || 0} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="appraisals">
                    <div className="grid gap-4 md:grid-cols-2">
                        {appraisals.length === 0 && !loading && (
                            <div className="col-span-full text-center p-8 text-muted-foreground border rounded-lg border-dashed">
                                No appraisals recorded yet.
                            </div>
                        )}
                        {appraisals.map((app) => (
                            <Card key={app.name}>
                                <CardHeader>
                                    <div className="flex justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="h-5 w-5 text-yellow-500" />
                                            {app.employee_name}
                                        </CardTitle>
                                        <Badge>{app.status}</Badge>
                                    </div>
                                    <CardDescription>{app.appraisal_cycle}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl font-bold">{app.final_score || "-"} <span className="text-sm text-muted-foreground font-normal">/ 5</span></div>
                                        <div className="text-sm text-muted-foreground italic">"{app.remarks || "No evaluation remarks"}"</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={isGoalOpen} onOpenChange={setIsGoalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set New Goal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Goal Description</Label>
                            <Input value={newGoal.goal} onChange={(e) => setNewGoal({ ...newGoal, goal: e.target.value })} placeholder="e.g. Achieve $50k Sales" />
                        </div>
                        <div className="space-y-2">
                            <Label>Initial Progress (%)</Label>
                            <Input type="number" min="0" max="100" value={newGoal.progress} onChange={(e) => setNewGoal({ ...newGoal, progress: parseInt(e.target.value) })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveGoal}>Save Goal</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
