"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { createTask } from "@/app/actions/handson/all/projects/tasks";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TaskList({ tasks }: { tasks: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const filtered = tasks.filter(t => t.subject?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-2xl font-bold">Tasks</h1><p className="text-muted-foreground">Manage project tasks.</p></div>
                <Link href="/handson/all/work_management/projects/task/new"><Button><Plus className="mr-2 h-4 w-4" /> New Task</Button></Link>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Project</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead>Due Date</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {filtered.map(t => (
                            <TableRow key={t.name}>
                                <TableCell className="font-medium">{t.subject}</TableCell>
                                <TableCell>{t.project}</TableCell>
                                <TableCell><Badge variant="outline">{t.status}</Badge></TableCell>
                                <TableCell>{t.priority}</TableCell>
                                <TableCell>{t.exp_end_date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export function TaskForm() {
    const router = useRouter();
    const [subject, setSubject] = useState("");
    const [project, setProject] = useState("");
    const [status, setStatus] = useState("Open");
    const [priority, setPriority] = useState("Medium");

    const handleSubmit = async () => {
        const res = await createTask({ subject, project, status, priority });
        if (res.success) { toast.success("Task Created"); router.push("/handson/all/work_management/projects/task"); }
        else toast.error(res.error);
    };

    return (
        <div className="max-w-xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">New Task</h1>
            <Card>
                <CardContent className="space-y-4 pt-4">
                    <div><Label>Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} /></div>
                    <div><Label>Project (Optional)</Label><Input value={project} onChange={e => setProject(e.target.value)} /></div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label>Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="Open">Open</SelectItem><SelectItem value="Working">Working</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <Label>Priority</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button onClick={handleSubmit}>Create Task</Button>
                </CardContent>
            </Card>
        </div>
    );
}
