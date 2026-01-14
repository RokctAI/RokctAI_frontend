"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ScrollText, Save, Edit2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import {
    MasterTerm,
    getMasterTerms,
    saveMasterTerm,
    deleteMasterTerm
} from "@/app/actions/handson/control/terms/terms";

export default function MasterTermsPage() {
    const [terms, setTerms] = useState<MasterTerm[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTerm, setEditingTerm] = useState<Partial<MasterTerm> | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        loadTerms();
    }, []);

    async function loadTerms() {
        setLoading(true);
        try {
            const data = await getMasterTerms();
            setTerms(data || []);
        } catch (e) {
            toast.error("Failed to load terms");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!editingTerm || !editingTerm.title) return;

        try {
            await saveMasterTerm(editingTerm.name, editingTerm.title, editingTerm.terms || "");
            toast.success("Term saved");
            setIsDialogOpen(false);
            setEditingTerm(null);
            loadTerms();
        } catch (e) {
            toast.error("Failed to save term");
        }
    }

    async function handleDelete(name: string) {
        if (!confirm("Are you sure you want to delete this term?")) return;
        try {
            await deleteMasterTerm(name);
            toast.success("Term deleted");
            loadTerms();
        } catch (e) {
            toast.error("Failed to delete term");
        }
    }

    const openEdit = (term: MasterTerm) => {
        setEditingTerm({ ...term });
        setIsDialogOpen(true);
    };

    const openNew = () => {
        setEditingTerm({ title: "", terms: "" });
        setIsDialogOpen(true);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Master Terms & Conditions</h1>
                    <p className="text-muted-foreground">Define standard legal text blocks (e.g. Payment Terms, Warranty) for all tenants.</p>
                </div>
                <Button onClick={openNew}>
                    <Plus className="mr-2 h-4 w-4" /> New Term
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Preview</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : terms.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                    No master terms found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            terms.map((t) => (
                                <TableRow key={t.name}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <ScrollText className="h-4 w-4 text-muted-foreground" />
                                            {t.title}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-[300px]">
                                        {t.terms?.substring(0, 100)}...
                                    </TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(t.name)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingTerm?.name ? "Edit Term" : "New Master Term"}</DialogTitle>
                        <DialogDescription>
                            This text will be available for import by all tenants.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={editingTerm?.title || ""}
                                onChange={(e) => setEditingTerm(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                                placeholder="e.g. Standard Payment Terms"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Content (Legal Text)</Label>
                            <Textarea
                                className="min-h-[200px]"
                                value={editingTerm?.terms || ""}
                                onChange={(e) => setEditingTerm(prev => prev ? ({ ...prev, terms: e.target.value }) : null)}
                                placeholder="Enter the full legal text here..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Term
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
