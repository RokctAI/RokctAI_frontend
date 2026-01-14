"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Download, Edit2, Trash2, Save, ScrollText } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import {
    getTenantTerms,
    getAvailableMasterTerms,
    importMasterTerm,
    saveTenantTerm,
    deleteTenantTerm
} from "@/app/actions/handson/tenant/settings/terms";

export default function TermsSettings() {
    const [terms, setTerms] = useState<any[]>([]);
    const [masterTerms, setMasterTerms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);

    // Editing State
    const [editingTerm, setEditingTerm] = useState<any>({ title: "", terms: "" });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const data = await getTenantTerms();
            setTerms(data || []);
        } catch (e) {
            toast.error("Failed to load terms");
        } finally {
            setLoading(false);
        }
    }

    async function handleOpenImport() {
        setIsImportOpen(true);
        try {
            const data = await getAvailableMasterTerms();
            setMasterTerms(data || []);
        } catch (e) {
            toast.error("Failed to load standard terms");
        }
    }

    async function handleImport(name: string) {
        try {
            await importMasterTerm(name);
            toast.success("Standard terms imported successfully");
            setIsImportOpen(false);
            loadData();
        } catch (e) {
            toast.error("Failed to import terms");
        }
    }

    async function handleSave() {
        if (!editingTerm.title) return;
        try {
            await saveTenantTerm(editingTerm.name, editingTerm.title, editingTerm.terms);
            toast.success("Terms saved");
            setIsEditOpen(false);
            loadData();
        } catch (e) {
            toast.error("Failed to save terms");
        }
    }

    async function handleDelete(name: string) {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteTenantTerm(name);
            toast.success("Term deleted");
            loadData();
        } catch (e) {
            toast.error("Deletion failed");
        }
    }

    const openEdit = (term?: any) => {
        if (term) {
            setEditingTerm(term);
        } else {
            setEditingTerm({ title: "", terms: "" });
        }
        setIsEditOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Terms & Conditions</h3>
                    <p className="text-sm text-muted-foreground">Manage legal text for your documents.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleOpenImport}>
                        <Download className="mr-2 h-4 w-4" /> Import Standard
                    </Button>
                    <Button onClick={() => openEdit()}>
                        <Plus className="mr-2 h-4 w-4" /> Create Custom
                    </Button>
                </div>
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
                            <TableRow><TableCell colSpan={3} className="text-center py-4">Loading...</TableCell></TableRow>
                        ) : terms.length === 0 ? (
                            <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No terms found. Import standard terms to get started.</TableCell></TableRow>
                        ) : (
                            terms.map(t => (
                                <TableRow key={t.name}>
                                    <TableCell className="font-medium">{t.title}</TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-[300px]">{t.terms?.substring(0, 80)}...</TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Edit2 className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(t.name)}><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTerm.name ? "Edit Terms" : "New Terms"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={editingTerm.title} onChange={e => setEditingTerm({ ...editingTerm, title: e.target.value })} placeholder="e.g. Standard Payment Terms" />
                        </div>
                        <div className="space-y-2">
                            <Label>Terms Content</Label>
                            <Textarea className="min-h-[200px]" value={editingTerm.terms} onChange={e => setEditingTerm({ ...editingTerm, terms: e.target.value })} placeholder="Full legal text..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Import Standard Terms</DialogTitle>
                        <DialogDescription>Select standard terms to add to your settings. These will become independent copies you can customize.</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <div className="grid gap-3 p-1">
                            {masterTerms.map(mt => (
                                <div key={mt.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <ScrollText className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-semibold">{mt.title}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{mt.terms}</p>
                                    </div>
                                    <Button size="sm" onClick={() => handleImport(mt.name)}>Import</Button>
                                </div>
                            ))}
                            {masterTerms.length === 0 && <p className="text-center text-muted-foreground py-4">No standard terms available.</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsImportOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
