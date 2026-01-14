"use client";

import { Loader2, Plus, Trash2, Edit, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
    getPrivacyPolicies,
    createPrivacyPolicy,
    updatePrivacyPolicy,
    deletePrivacyPolicy
} from "@/app/actions/paas/admin/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function PrivacyPolicyPage() {
    const [loading, setLoading] = useState(true);
    const [policies, setPolicies] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        active: 1
    });

    useEffect(() => {
        loadPolicies();
    }, []);

    async function loadPolicies() {
        try {
            const data = await getPrivacyPolicies();
            setPolicies(data);
        } catch (error) {
            toast.error("Failed to load Privacy Policies");
        } finally {
            setLoading(false);
        }
    }

    function handleOpenDialog(policy?: any) {
        if (policy) {
            setEditingPolicy(policy);
            setFormData({
                title: policy.title,
                content: policy.content,
                active: policy.active
            });
        } else {
            setEditingPolicy(null);
            setFormData({
                title: "",
                content: "",
                active: 1
            });
        }
        setIsDialogOpen(true);
    }

    async function handleSave() {
        try {
            if (editingPolicy) {
                await updatePrivacyPolicy(editingPolicy.name, formData);
                toast.success("Privacy Policy updated");
            } else {
                await createPrivacyPolicy(formData);
                toast.success("Privacy Policy created");
            }
            setIsDialogOpen(false);
            loadPolicies();
        } catch (error) {
            toast.error("Failed to save Privacy Policy");
        }
    }

    async function handleDelete(name: string) {
        if (!confirm("Are you sure you want to delete this Privacy Policy?")) return;
        try {
            await deletePrivacyPolicy(name);
            toast.success("Privacy Policy deleted");
            loadPolicies();
        } catch (error) {
            toast.error("Failed to delete Privacy Policy");
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="size-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Privacy Policy</h2>
                    <p className="text-muted-foreground">
                        Manage Privacy Policies for your platform.
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 size-4" />
                    Add Policy
                </Button>
            </div>

            <div className="grid gap-4">
                {policies.map((policy) => (
                    <Card key={policy.name}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{policy.title}</CardTitle>
                                    <CardDescription className="mt-1">
                                        Status: <span className={policy.active ? "text-green-600" : "text-red-600"}>
                                            {policy.active ? "Active" : "Inactive"}
                                        </span>
                                    </CardDescription>
                                </div>
                                <div className="flex space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(policy)}>
                                        <Edit className="size-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(policy.name)}>
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                                {policy.content}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {policies.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No Privacy Policies found. Create one to get started.
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingPolicy ? "Edit Policy" : "Add Policy"}</DialogTitle>
                        <DialogDescription>
                            {editingPolicy ? "Update the details of this Privacy Policy." : "Create a new Privacy Policy."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., General Privacy Policy"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Content</Label>
                            <Textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Enter the full privacy policy content here..."
                                className="min-h-[200px]"
                            />
                        </div>
                        <div className="space-y-2 flex flex-col justify-end pb-2">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={!!formData.active}
                                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked ? 1 : 0 })}
                                />
                                <Label>Active</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
