import React from "react";
import Link from "next/link";
import { getTasks } from "@/app/actions/handson/all/crm/tasks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function TasksPage() {
    const result = await getTasks(1, 50);
    const tasks = result.data;

    // Helper Initials
    const getInitials = (name: string) => {
        return (name || "?").substring(0, 2).toUpperCase();
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "High": return "destructive";
            case "Medium": return "secondary"; // or a custom warning variant if available
            default: return "outline";
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground">Manage your daily tasks and priorities.</p>
                </div>
                <Button asChild>
                    <Link href="/handson/all/crm/tasks/new">Create Task</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    {tasks.length === 0 ? (
                        <div className="flex h-40 items-center justify-center text-muted-foreground">
                            No tasks found.
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Title</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Assigned To</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Priority</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Due Date</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {tasks.map((task: any) => (
                                        <tr
                                            key={task.name}
                                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                        >
                                            <td className="p-4 align-middle font-medium">{task.title}</td>
                                            <td className="p-4 align-middle">
                                                {task.assigned_to ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarFallback className="text-[10px]">{getInitials(task.assigned_to)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm text-muted-foreground">{task.assigned_to}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Badge variant={getPriorityColor(task.priority) as any}>
                                                    {task.priority}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Badge variant="outline">{task.status}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
