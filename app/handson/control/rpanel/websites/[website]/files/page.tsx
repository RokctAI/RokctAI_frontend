"use client";

import React, { useEffect, useState } from "react";
import {
    Folder, File, FileText, Download, Trash2, Upload,
    ChevronRight, Home, RefreshCw, MoreVertical, Edit
} from "lucide-react";
import { getFiles, deleteFile } from "@/app/actions/handson/control/rpanel/files";
// import { RPanelNav } from "@/components/custom/nav/rpanel-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/components/ui/use-toast";

export default function FileManagerPage({ params }: { params: { website: string } }) {
    const [files, setFiles] = useState<any[]>([]);
    const [currentPath, setCurrentPath] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadFiles("");
    }, []);

    async function loadFiles(path: string) {
        setIsLoading(true);
        try {
            const res = await getFiles(params.website, path);

            if (res.success && res.data) {
                setFiles(res.data.items);
                setCurrentPath(res.data.current_path);
            } else {
                throw new Error(res.error || "Failed to load files");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to load files",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleNavigate = (path: string) => {
        loadFiles(path);
    };

    const handleDownload = async (filePath: string) => {
        // Implementation for download would go here - usually needs a direct link or blob handling
        // For now just show toast
        toast({ title: "Info", description: "Download started..." });
        window.open(`/api/rpanel/download?website=${params.website}&path=${encodeURIComponent(filePath)}`, '_blank');
    };

    const handleDelete = async (filePath: string) => {
        if (!confirm("Are you sure you want to delete this file?")) return;

        try {
            const res = await deleteFile(params.website, filePath);
            if (res.success) {
                toast({ title: "Success", description: "File deleted" });
                loadFiles(currentPath);
            } else {
                throw new Error(res.error);
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    // Helper to split path for breadcrumbs
    const getPathParts = (path: string) => {
        if (!path) return [];
        return path.split('/').filter(Boolean);
    };

    return (
        <div className="flex min-h-screen bg-[#0f1219] text-gray-200 font-sans">
            {/* <RPanelNav /> */}
            <main className="flex-1 p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">File Manager</h1>
                        <p className="text-muted-foreground">Manage files for {params.website}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => loadFiles(currentPath)}>
                            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                        </Button>
                        <Button>
                            <Upload className="mr-2 h-4 w-4" /> Upload
                        </Button>
                    </div>
                </div>

                {/* Breadcrumbs */}
                <div className="bg-[#1a1f36] p-4 rounded-t-lg border-b border-gray-700 flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => loadFiles("")}>
                        <Home className="h-4 w-4" />
                    </Button>
                    <span className="text-gray-500">/</span>
                    {getPathParts(currentPath).map((part, index, arr) => {
                        const fullPath = arr.slice(0, index + 1).join('/');
                        return (
                            <React.Fragment key={fullPath}>
                                <button
                                    className="hover:text-blue-400 hover:underline"
                                    onClick={() => loadFiles(fullPath)}
                                >
                                    {part}
                                </button>
                                {index < arr.length - 1 && <span className="text-gray-500">/</span>}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* File List */}
                <div className="bg-[#1a1f36] rounded-b-lg border border-gray-700 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-700 hover:bg-transparent">
                                <TableHead className="w-[50%]">Name</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Modified</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">Loading...</TableCell>
                                </TableRow>
                            ) : files.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">Empty directory</TableCell>
                                </TableRow>
                            ) : (
                                files.map((file) => (
                                    <TableRow key={file.path} className="border-gray-700 hover:bg-[#252b42]">
                                        <TableCell>
                                            <div
                                                className="flex items-center gap-2 cursor-pointer group"
                                                onClick={() => file.is_dir ? handleNavigate(file.path) : null}
                                            >
                                                {file.is_dir ? (
                                                    <Folder className="h-5 w-5 text-blue-400 fill-blue-400/20" />
                                                ) : (
                                                    <FileText className="h-5 w-5 text-gray-400" />
                                                )}
                                                <span className={file.is_dir ? "font-medium group-hover:text-blue-400" : ""}>
                                                    {file.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{file.is_dir ? '-' : (file.size / 1024).toFixed(1) + ' KB'}</TableCell>
                                        <TableCell>{new Date(file.modified * 1000).toLocaleString()}</TableCell>
                                        <TableCell className="font-mono text-xs">{file.permissions}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                {!file.is_dir && (
                                                    <Button variant="ghost" size="icon" onClick={() => handleDownload(file.path)}>
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => handleDelete(file.path)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>
        </div>
    );
}
