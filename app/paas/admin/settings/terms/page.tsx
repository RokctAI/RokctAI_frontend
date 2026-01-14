"use client";

import { Loader2, Plus, Trash2, Edit, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
    getTerms,
    createTerm,
    updateTerm,
    deleteTerm
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

export default function TermsPage() {
    const [loading, setLoading] = useState(true);
    const [terms, setTerms] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTerm, setEditingTerm] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "",
        terms: "",
        disabled: 0
    });

    useEffect(() => {
        loadTerms();
    }, []);

    async function loadTerms() {
        try {
            const data = await getTerms();
            setTerms(data);
        } catch (error) {
            toast.error("Failed to load Terms");
        } finally {
            setLoading(false);
        }
    }

    function handleOpenDialog(term?: any) {
        if (term) {
            setEditingTerm(term);
            setFormData({
                title: term.title,
                terms: term.terms,
                disabled: term.disabled
            });
        } else {
            setEditingTerm(null);
            setFormData({
                title: "",
                terms: "",
                disabled: 0
            });
        }
        setIsDialogOpen(true);
    }

    async function handleSave() {
        try {
            if (editingTerm) {
                await updateTerm(editingTerm.name, formData);
                toast.success("Term updated");
            } else {
                await createTerm(formData);
                toast.success("Term created");
            }
            setIsDialogOpen(false);
            loadTerms();
        } catch (error) {
            toast.error("Failed to save Term");
        }
    }

    async function handleDelete(name: string) {
        if (!confirm("Are you sure you want to delete this Term?")) return;
        try {
            await deleteTerm(name);
            toast.success("Term deleted");
            loadTerms();
        } catch (error) {
            toast.error("Failed to delete Term");
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
                    <h2 className="text-3xl font-bold tracking-tight">Terms and Conditions</h2>
                    <p className="text-muted-foreground">
                        Manage Terms and Conditions for your platform.
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 size-4" />
                    Add Term
                </Button>
            </div>

            <div className="grid gap-4">
                {terms.map((term) => (
                    <Card key={term.name}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{term.title}</CardTitle>
                                    <CardDescription className="mt-1">
                                        Status: <span className={!term.disabled ? "text-green-600" : "text-red-600"}>
                                            {!term.disabled ? "Active" : "Disabled"}
                                        </span>
                                    </CardDescription>
                                </div>
                                <div className="flex space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(term)}>
                                        <Edit className="size-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(term.name)}>
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                                {term.terms}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {terms.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No Terms found. Create one to get started.
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingTerm ? "Edit Term" : "Add Term"}</DialogTitle>
                        <DialogDescription>
                            {editingTerm ? "Update the details of this Term." : "Create a new Term."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., User Agreement"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Terms Content</Label>
                            <Textarea
                                value={formData.terms}
                                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                                placeholder="Enter the full terms and conditions here..."
                                className="min-h-[200px]"
                            />
                        </div>
                        <div className="space-y-2 flex flex-col justify-end pb-2">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={!formData.disabled}
                                    onCheckedChange={(checked) => setFormData({ ...formData, disabled: checked ? 0 : 1 })}
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
