"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Megaphone, Plus, Trash2, Save, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

import {
    Announcement,
    getGlobalAnnouncements,
    saveGlobalAnnouncement,
    deleteGlobalAnnouncement,
    seedAnnouncements
} from "@/app/actions/handson/control/announcements/announcements";

const PLANS = ["Simple", "Pro", "Enterprise"];

export default function AnnouncementsPage() {
    const [list, setList] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [editing, setEditing] = useState<Announcement>({
        title: "",
        content: "",
        target_plans: ["All"],
        is_active: true
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const data = await getGlobalAnnouncements();
            setList(data);
        } catch (e) {
            toast.error("Failed to load announcements");
        } finally {
            setLoading(false);
        }
    }

    async function handleSeed() {
        await seedAnnouncements();
        toast.success("Seeded examples");
        loadData();
    }

    async function handleSave() {
        if (!editing.title || !editing.content) return toast.error("Title and Content required");
        try {
            await saveGlobalAnnouncement(editing);
            toast.success("Announcement Saved");
            setIsEditOpen(false);
            loadData();
        } catch (e) {
            toast.error("Failed to save");
        }
    }

    async function handleDelete(name?: string) {
        if (!name || !confirm("Delete?")) return;
        await deleteGlobalAnnouncement(name);
        toast.success("Deleted");
        loadData();
    }

    const openNew = () => {
        setEditing({ title: "", content: "", target_plans: ["All"], is_active: true });
        setIsEditOpen(true);
    };

    const togglePlan = (plan: string) => {
        let newPlans = [...editing.target_plans];
        if (plan === "All") {
            newPlans = ["All"];
        } else {
            // Remove All if specific selected
            newPlans = newPlans.filter(p => p !== "All");
            if (newPlans.includes(plan)) {
                newPlans = newPlans.filter(p => p !== plan);
            } else {
                newPlans.push(plan);
            }
            if (newPlans.length === 0) newPlans = ["All"];
        }
        setEditing({ ...editing, target_plans: newPlans });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Megaphone className="h-8 w-8" /> Announcements
                    </h1>
                    <p className="text-muted-foreground">Broadcast updates to tenants based on their plan.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSeed}>Seed Examples</Button>
                    <Button onClick={openNew}>
                        <Plus className="mr-2 h-4 w-4" /> New Broadcast
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {list.map(ann => (
                    <Card key={ann.name} className={ann.is_active ? "border-l-4 border-l-green-500" : "opacity-75"}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{ann.title}</CardTitle>
                                {!ann.is_active && <Badge variant="secondary">Draft</Badge>}
                            </div>
                            <div className="flex gap-1 mt-1">
                                {ann.target_plans.map(p => (
                                    <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-3">{ann.content}</p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setEditing(ann); setIsEditOpen(true); }}>Edit</Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(ann.name)}>Delete</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Compose Announcement</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Content (Markdown supported)</Label>
                            <Textarea className="h-32" value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <Label>Target Audience</Label>
                            <div className="flex gap-4 flex-wrap">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="plan-all" checked={editing.target_plans.includes("All")} onCheckedChange={() => togglePlan("All")} />
                                    <label htmlFor="plan-all">All Plans</label>
                                </div>
                                {PLANS.map(p => (
                                    <div key={p} className="flex items-center space-x-2">
                                        <Checkbox id={`plan-${p}`} checked={editing.target_plans.includes(p)} onCheckedChange={() => togglePlan(p)} />
                                        <label htmlFor={`plan-${p}`}>{p}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <Switch checked={editing.is_active} onCheckedChange={(c) => setEditing({ ...editing, is_active: c })} />
                            <Label>Publish Immediately</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave}><Send className="mr-2 h-4 w-4" /> Save & Publish</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
