"use client";

import { format } from "date-fns";
import { Loader2, Database, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getBackups, createBackup } from "@/app/actions/paas/admin/system";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function BackupsPage() {
    const [backups, setBackups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchBackups();
    }, []);

    async function fetchBackups() {
        try {
            const data = await getBackups();
            setBackups(data);
        } catch (error) {
            console.error("Error fetching backups:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateBackup() {
        setCreating(true);
        try {
            await createBackup();
            toast.success("Backup created successfully");
            fetchBackups();
        } catch (error) {
            toast.error("Failed to create backup");
        } finally {
            setCreating(false);
        }
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Database Backups</h1>
                <Button onClick={handleCreateBackup} disabled={creating}>
                    {creating ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Database className="mr-2 size-4" />}
                    Create Backup
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>File</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="size-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : backups.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No backups found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            backups.map((backup) => (
                                <TableRow key={backup.name}>
                                    <TableCell>{format(new Date(backup.creation), "PPP p")}</TableCell>
                                    <TableCell>{backup.size_mb} MB</TableCell>
                                    <TableCell className="font-mono text-sm">{backup.file_name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="outline">
                                            <Download className="size-4 mr-2" />
                                            Download
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
