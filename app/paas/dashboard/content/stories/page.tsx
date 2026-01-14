"use client";

import { Loader2, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getStories, createStory, deleteStory } from "@/app/actions/paas/stories";
import { ImageUpload } from "@/components/custom/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StoriesPage() {
    const [stories, setStories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        image: "",
        link: ""
    });

    useEffect(() => {
        fetchStories();
    }, []);

    async function fetchStories() {
        try {
            const data = await getStories();
            setStories(data);
        } catch (error) {
            console.error("Error fetching stories:", error);
            toast.error("Failed to load stories");
        } finally {
            setLoading(false);
        }
    }

    const handleOpenDialog = () => {
        setFormData({ title: "", image: "", link: "" });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.image) {
            toast.error("Title and image are required");
            return;
        }

        setProcessing(true);
        try {
            await createStory(formData);
            toast.success("Story created successfully");
            setIsDialogOpen(false);
            fetchStories();
        } catch (error) {
            console.error("Error creating story:", error);
            toast.error("Failed to create story");
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this story?")) return;
        try {
            await deleteStory(id);
            toast.success("Story deleted successfully");
            fetchStories();
        } catch (error) {
            console.error("Error deleting story:", error);
            toast.error("Failed to delete story");
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Stories</h1>
                    <p className="text-muted-foreground">Instagram-style stories for your shop.</p>
                </div>
                <Button onClick={handleOpenDialog}>
                    <Plus className="mr-2 size-4" />
                    Add Story
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {stories.length === 0 ? (
                    <Card className="col-span-full">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No stories found. Add your first story to get started.
                        </CardContent>
                    </Card>
                ) : (
                    stories.map((story) => (
                        <Card key={story.name} className="overflow-hidden">
                            <div className="aspect-[9/16] relative bg-muted">
                                {story.image ? (
                                    <img
                                        src={story.image}
                                        alt={story.title}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <ImageIcon className="size-12 text-muted-foreground" />
                                    </div>
                                )}
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 size-8"
                                    onClick={() => handleDelete(story.name)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                            <CardContent className="p-3">
                                <p className="text-sm font-medium truncate">{story.title}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Story</DialogTitle>
                        <DialogDescription>Create a new story for your shop.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="New Product Launch"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="link">Link (Optional)</Label>
                            <Input
                                id="link"
                                value={formData.link}
                                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                placeholder="https://..."
                            />
                        </div>
                        <ImageUpload
                            label="Story Image (9:16 ratio recommended) *"
                            value={formData.image}
                            onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSubmit} disabled={processing}>
                            {processing ? <Loader2 className="size-4 animate-spin" /> : "Add Story"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
