"use client";

import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";
import { toast } from "sonner";

import { uploadFile } from "@/app/actions/paas/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    accept?: string;
}

export function ImageUpload({ value, onChange, label = "Image", accept = "image/*" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(value || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        setUploading(true);
        try {
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Upload file
            const formData = new FormData();
            formData.append("file", file);

            const result = await uploadFile(formData);
            onChange(result.file_url);
            toast.success("Image uploaded successfully");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image");
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>

            {preview ? (
                <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-muted">
                    <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-contain"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemove}
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors">
                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center size-full cursor-pointer">
                        {uploading ? (
                            <Loader2 className="size-12 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <ImageIcon className="size-12 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
                            </>
                        )}
                    </label>
                    <Input
                        id="file-upload"
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                    />
                </div>
            )}
        </div>
    );
}
