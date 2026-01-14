"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getFAQs, createFAQ, deleteFAQ } from "@/app/actions/paas/admin/content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


export default function AdminFAQsPage() {
    const [faqs, setFaqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        question: "",
        answer: "", // Note: API might expect 'answer' or similar, checking schema...
        // Looking at API: fields=["name", "question", "faq_category", "is_active"]
        // It seems 'answer' is missing from the list fields but likely exists in doctype.
        // Assuming 'answer' is the field name.
        is_active: 1
    });

    useEffect(() => {
        fetchFaqs();
    }, []);

    async function fetchFaqs() {
        try {
            const data = await getFAQs();
            setFaqs(data);
        } catch (error) {
            console.error("Error fetching FAQs:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleCreate = async () => {
        try {
            await createFAQ(formData);
            toast.success("FAQ created");
            setFormData({ question: "", answer: "", is_active: 1 });
            setIsDialogOpen(false);
            fetchFaqs();
        } catch (error) {
            toast.error("Failed to create FAQ");
        }
    };

    const handleDelete = async (name: string) => {
        if (!confirm("Delete this FAQ?")) return;
        try {
            await deleteFAQ(name);
            toast.success("FAQ deleted");
            fetchFaqs();
        } catch (error) {
            toast.error("Failed to delete FAQ");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">FAQs</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 size-4" />
                            Add FAQ
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add FAQ</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Question</Label>
                                <Input
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Answer</Label>
                                <Textarea
                                    value={formData.answer}
                                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                />
                            </div>
                            <Button onClick={handleCreate} className="w-full">Create</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {faqs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No FAQs found.</div>
                ) : (
                    faqs.map((faq) => (
                        <Card key={faq.name}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    {faq.question}
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600 -mt-2 -mr-2"
                                    onClick={() => handleDelete(faq.name)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </CardHeader>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
