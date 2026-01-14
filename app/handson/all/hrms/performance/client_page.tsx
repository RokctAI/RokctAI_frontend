"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { createGoal, createAppraisal } from "@/app/actions/handson/all/hrms/performance";

const goalSchema = z.object({
    employee: z.string().min(1, "Employee is required"),
    goal: z.string().min(1, "Goal description is required"),
    start_date: z.string().min(1, "Start Date is required"),
    end_date: z.string().min(1, "End Date is required"),
    status: z.enum(["Pending", "In Progress", "Completed", "Cancelled"])
});

const appraisalSchema = z.object({
    employee: z.string().min(1, "Employee is required"),
    appraisal_cycle: z.string().min(1, "Cycle is required"),
    status: z.enum(["Scheduled", "Completed", "Pending Review"]),
    remarks: z.string().optional()
});

export default function ClientPerformancePage({ initialGoals, initialAppraisals, employees }: { initialGoals: any[], initialAppraisals: any[], employees: any[] }) {
    const [goals, setGoals] = useState(initialGoals);
    const [appraisals, setAppraisals] = useState(initialAppraisals);
    const [activeTab, setActiveTab] = useState("goals");
    const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
    const [isAppraisalDialogOpen, setIsAppraisalDialogOpen] = useState(false);

    const goalForm = useForm<z.infer<typeof goalSchema>>({
        resolver: zodResolver(goalSchema),
        defaultValues: { status: "Pending", start_date: format(new Date(), "yyyy-MM-dd"), end_date: format(new Date(), "yyyy-MM-dd") }
    });

    const appraisalForm = useForm<z.infer<typeof appraisalSchema>>({
        resolver: zodResolver(appraisalSchema),
        defaultValues: { status: "Scheduled" }
    });

    async function onGoalSubmit(values: z.infer<typeof goalSchema>) {
        const res = await createGoal(values);
        if (res.success) {
            toast.success("Goal Created");
            setIsGoalDialogOpen(false);
            goalForm.reset();
            // In a real app we'd re-fetch or optimistically update. 
            // For now relies on Next.js revalidatePath which might need router.refresh() in client component?
            // Usually valid to reload or use router.refresh() 
            window.location.reload();
        } else {
            toast.error("Failed: " + res.error);
        }
    }

    async function onAppraisalSubmit(values: z.infer<typeof appraisalSchema>) {
        const res = await createAppraisal(values);
        if (res.success) {
            toast.success("Appraisal Scheduled");
            setIsAppraisalDialogOpen(false);
            appraisalForm.reset();
            window.location.reload();
        } else {
            toast.error("Failed: " + res.error);
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Performance Management</h1>
                {activeTab === "goals" && (
                    <Button onClick={() => setIsGoalDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Goal</Button>
                )}
                {activeTab === "appraisals" && (
                    <Button onClick={() => setIsAppraisalDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Schedule Appraisal</Button>
                )}
            </div>

            <Tabs defaultValue="goals" onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="goals">Employee Goals</TabsTrigger>
                    <TabsTrigger value="appraisals">Appraisals</TabsTrigger>
                </TabsList>

                <TabsContent value="goals" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>All Goals</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Goal</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {goals.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted">No goals found</TableCell></TableRow> :
                                        goals.map(g => (
                                            <TableRow key={g.name}>
                                                <TableCell className="font-medium">{g.employee_name}</TableCell>
                                                <TableCell>{g.goal}</TableCell>
                                                <TableCell>{g.start_date} - {g.end_date}</TableCell>
                                                <TableCell><Badge variant="outline">{g.status}</Badge></TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appraisals" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Appraisals</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Cycle</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appraisals.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted">No appraisals found</TableCell></TableRow> :
                                        appraisals.map(a => (
                                            <TableRow key={a.name}>
                                                <TableCell className="font-medium">{a.employee_name}</TableCell>
                                                <TableCell>{a.appraisal_cycle}</TableCell>
                                                <TableCell>{a.final_score || "-"}</TableCell>
                                                <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Goal Dialog */}
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>New Goal</DialogTitle></DialogHeader>
                    <Form {...goalForm}>
                        <form onSubmit={goalForm.handleSubmit(onGoalSubmit)} className="space-y-4">
                            <FormField control={goalForm.control} name="employee" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Employee</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {employees.map(e => <SelectItem key={e.name} value={e.name}>{e.employee_name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={goalForm.control} name="goal" render={({ field }) => (
                                <FormItem><FormLabel>Goal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={goalForm.control} name="start_date" render={({ field }) => (
                                    <FormItem><FormLabel>Start</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={goalForm.control} name="end_date" render={({ field }) => (
                                    <FormItem><FormLabel>End</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Appraisal Dialog */}
            <Dialog open={isAppraisalDialogOpen} onOpenChange={setIsAppraisalDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>New Appraisal</DialogTitle></DialogHeader>
                    <Form {...appraisalForm}>
                        <form onSubmit={appraisalForm.handleSubmit(onAppraisalSubmit)} className="space-y-4">
                            <FormField control={appraisalForm.control} name="employee" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Employee</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {employees.map(e => <SelectItem key={e.name} value={e.name}>{e.employee_name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={appraisalForm.control} name="appraisal_cycle" render={({ field }) => (
                                <FormItem><FormLabel>Cycle (e.g., 2024-Q1)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={appraisalForm.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                                            <SelectItem value="Pending Review">Pending Review</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <DialogFooter><Button type="submit">Schedule</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
