"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Plus, Search, Copy } from "lucide-react";
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cloneProject } from "@/app/actions/handson/all/projects/cloning";
import { deleteProject } from "@/app/actions/handson/all/projects/projects";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface ProjectListProps {
    projects: any[];
}

export function ProjectList({ projects }: ProjectListProps) {
    const router = useRouter();

    const handleDelete = async (name: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        const result = await deleteProject(name);
        if (result.success) {
            toast.success("Project deleted");
            router.refresh();
        } else {
            toast.error("Failed to delete: " + result.error);
        }
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [isCloneOpen, setIsCloneOpen] = useState(false);
    const [projectToClone, setProjectToClone] = useState<any>(null);
    const [newProjectName, setNewProjectName] = useState("");

    const openClone = (project: any) => {
        setProjectToClone(project);
        setNewProjectName(`Copy of ${project.project_name}`);
        setIsCloneOpen(true);
    };

    const handleClone = async () => {
        if (!projectToClone || !newProjectName) return;

        try {
            const result = await cloneProject(projectToClone.name, newProjectName);
            if (result.success) {
                toast.success("Project cloned successfully");
                setIsCloneOpen(false);
                router.refresh();
            } else {
                toast.error("Failed to clone: " + result.message);
            }
        } catch (e) {
            toast.error("An unexpected error occurred");
        }
    };

    const filteredProjects = projects.filter(p =>
        p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.status && p.status.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Projects</h1>
                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Link href="/handson/all/work_management/projects/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Project
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Project Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>% Complete</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProjects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No projects found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProjects.map((p) => (
                                <TableRow key={p.name}>
                                    <TableCell className="font-medium">{p.project_name}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                            ${p.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                p.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {p.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{p.priority}</TableCell>
                                    <TableCell className="w-[200px]">
                                        <div className="flex items-center gap-2">
                                            <Progress value={p.percent_complete || 0} className="w-[60%]" />
                                            <span className="text-xs text-muted-foreground">{p.percent_complete}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{p.expected_end_date}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 justify-end">
                                            <Link href={`/handson/all/work_management/projects/${p.name}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openClone(p)}
                                                title="Duplicate Project"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(p.name)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isCloneOpen} onOpenChange={setIsCloneOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Duplicate Project</DialogTitle>
                        <DialogDescription>
                            Create a copy of <strong>{projectToClone?.project_name}</strong>. Tasks will also be copied.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">New Project Name</Label>
                            <Input
                                id="name"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCloneOpen(false)}>Cancel</Button>
                        <Button onClick={handleClone}>Duplicate</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
