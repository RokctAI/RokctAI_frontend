"use client";

import { Loader2, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getGalleryImages, addGalleryImage, deleteGalleryImage } from "@/app/actions/paas/gallery";
import { ImageUpload } from "@/components/custom/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function GalleryPage() {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [newImage, setNewImage] = useState("");

    useEffect(() => {
        fetchImages();
    }, []);

    async function fetchImages() {
        try {
            const data = await getGalleryImages();
            setImages(data);
        } catch (error) {
            console.error("Error fetching gallery:", error);
            toast.error("Failed to load gallery");
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async () => {
        if (!newImage) {
            toast.error("Image is required");
            return;
        }

        setProcessing(true);
        try {
            await addGalleryImage({ image: newImage });
            toast.success("Image added successfully");
            setIsDialogOpen(false);
            setNewImage("");
            fetchImages();
        } catch (error) {
            console.error("Error adding image:", error);
            toast.error("Failed to add image");
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (name: string) => {
        if (!confirm("Are you sure you want to delete this image?")) return;
        try {
            await deleteGalleryImage(name);
            toast.success("Image deleted successfully");
            fetchImages();
        } catch (error) {
            console.error("Error deleting image:", error);
            toast.error("Failed to delete image");
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
                    <h1 className="text-3xl font-bold">Shop Gallery</h1>
                    <p className="text-muted-foreground">Showcase your shop with a photo gallery.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    Add Image
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.length === 0 ? (
                    <Card className="col-span-full">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No images found. Add some photos to showcase your shop.
                        </CardContent>
                    </Card>
                ) : (
                    images.map((img) => (
                        <Card key={img.name} className="overflow-hidden group relative">
                            <div className="aspect-square relative bg-muted">
                                <img
                                    src={img.image}
                                    alt="Gallery"
                                    className="size-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleDelete(img.name)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Gallery Image</DialogTitle>
                        <DialogDescription>Upload a photo for your shop gallery.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <ImageUpload
                            label="Image"
                            value={newImage}
                            onChange={setNewImage}
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSubmit} disabled={processing}>
                            {processing ? <Loader2 className="size-4 animate-spin" /> : "Add Image"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
