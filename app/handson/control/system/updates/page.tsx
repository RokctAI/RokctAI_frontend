"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, CheckCircle, XCircle, GitBranch } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
    getUpdateAuthorizations,
    approveUpdate,
    rejectUpdate
} from "@/app/actions/handson/control/system/system";

export default function UpdatesPage() {
    const [updates, setUpdates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchData() {
        setLoading(true);
        try {
            const data = await getUpdateAuthorizations();
            setUpdates(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch updates");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const onApprove = async (name: string) => {
        if (!confirm("Authorize this update?")) return;
        try {
            await approveUpdate(name);
            toast.success("Update authorized");
            fetchData();
        } catch (error) {
            toast.error("Failed to authorize update");
        }
    };

    const onReject = async (name: string) => {
        if (!confirm("Reject this update?")) return;
        try {
            await rejectUpdate(name);
            toast.success("Update rejected");
            fetchData();
        } catch (error) {
            toast.error("Failed to reject update");
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">System Updates</h1>
                    <p className="text-muted-foreground">Manage application update authorizations.</p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchData} title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Authorizations</CardTitle>
                    <CardDescription>Requests to update apps on the server.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>App Name</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Requested By</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {updates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No pending updates.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                updates.map((update) => (
                                    <TableRow key={update.name}>
                                        <TableCell className="font-medium">{update.app_name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <GitBranch className="h-3 w-3 text-muted-foreground" />
                                                {update.new_branch_name || "Default"}
                                            </div>
                                        </TableCell>
                                        <TableCell>{update.requested_by}</TableCell>
                                        <TableCell>{update.creation ? format(new Date(update.creation), "MMM d, HH:mm") : "-"}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                update.status === "Authorized" ? "default" :
                                                    update.status === "Rejected" ? "destructive" : "secondary"
                                            }>
                                                {update.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {update.status === "Pending" && (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => onApprove(update.name)}>
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onReject(update.name)}>
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
