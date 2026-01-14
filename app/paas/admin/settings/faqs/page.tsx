"use client";

import { Loader2, Plus, Trash2, Edit, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
    getFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ
} from "@/app/actions/paas/admin/content";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function FAQsPage() {
    const [loading, setLoading] = useState(true);
    const [faqs, setFaqs] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<any>(null);
    const [formData, setFormData] = useState({
        question: "",
        answer: "",
        type: "web",
        active: 1
    });

    useEffect(() => {
        loadFaqs();
    }, []);

    async function loadFaqs() {
        try {
            const data = await getFAQs();
            setFaqs(data);
        } catch (error) {
            toast.error("Failed to load FAQs");
        } finally {
            setLoading(false);
        }
    }

    function handleOpenDialog(faq?: any) {
        if (faq) {
            setEditingFaq(faq);
            setFormData({
                question: faq.question,
                answer: faq.answer,
                type: faq.type,
                active: faq.active
            });
        } else {
            setEditingFaq(null);
            setFormData({
                question: "",
                answer: "",
                type: "web",
                active: 1
            });
        }
        setIsDialogOpen(true);
    }

    async function handleSave() {
        try {
            if (editingFaq) {
                await updateFAQ(editingFaq.name, formData);
                toast.success("FAQ updated");
            } else {
                await createFAQ(formData);
                toast.success("FAQ created");
            }
            setIsDialogOpen(false);
            loadFaqs();
        } catch (error) {
            toast.error("Failed to save FAQ");
        }
    }

    async function handleDelete(name: string) {
        if (!confirm("Are you sure you want to delete this FAQ?")) return;
        try {
            await deleteFAQ(name);
            toast.success("FAQ deleted");
            loadFaqs();
        } catch (error) {
            toast.error("Failed to delete FAQ");
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
                    <h2 className="text-3xl font-bold tracking-tight">FAQs</h2>
                    <p className="text-muted-foreground">
                        Manage Frequently Asked Questions for your users.
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 size-4" />
                    Add FAQ
                </Button>
            </div>

            <div className="grid gap-4">
                {faqs.map((faq) => (
                    <Card key={faq.name}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                                    <CardDescription className="mt-1">
                                        Type: <span className="capitalize">{faq.type}</span> •
                                        Status: <span className={faq.active ? "text-green-600" : "text-red-600"}>
                                            {faq.active ? "Active" : "Inactive"}
                                        </span>
                                    </CardDescription>
                                </div>
                                <div className="flex space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(faq)}>
                                        <Edit className="size-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(faq.name)}>
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {faq.answer}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {faqs.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No FAQs found. Create one to get started.
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingFaq ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
                        <DialogDescription>
                            {editingFaq ? "Update the details of this FAQ." : "Create a new Frequently Asked Question."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Question</Label>
                            <Input
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                placeholder="e.g., How do I reset my password?"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Answer</Label>
                            <Textarea
                                value={formData.answer}
                                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                placeholder="Enter the answer here..."
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="web">Web</SelectItem>
                                        <SelectItem value="mobile">Mobile</SelectItem>
                                        <SelectItem value="driver">Driver</SelectItem>
                                        <SelectItem value="seller">Seller</SelectItem>
                                    </SelectContent>
                                </Select>
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
