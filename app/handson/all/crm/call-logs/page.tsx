import React from "react";
import { getCallLogs } from "@/app/actions/handson/all/crm/call_logs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";

export default async function CallLogsPage({ searchParams }: { searchParams: { page?: string } }) {
    const page = parseInt(searchParams.page || "1");
    const result = await getCallLogs(page);
    const logs = result.data || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Completed": return "bg-green-100 text-green-800 hover:bg-green-100";
            case "Missed": return "bg-red-100 text-red-800 hover:bg-red-100";
            case "Busy": return "bg-orange-100 text-orange-800 hover:bg-orange-100";
            default: return "secondary";
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Incoming': return <PhoneIncoming className="w-4 h-4 text-blue-500" />;
            case 'Outgoing': return <PhoneOutgoing className="w-4 h-4 text-green-500" />;
            default: return <Phone className="w-4 h-4" />;
        }
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Call Logs</h1>
                    <p className="text-muted-foreground">History of all incoming and outgoing calls</p>
                </div>
            </div>

            <div className="border rounded-lg shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Owner</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No call logs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log: any) => (
                                <TableRow key={log.name}>
                                    <TableCell>{getIcon(log.call_type)}</TableCell>
                                    <TableCell className="font-medium">
                                        <div>{new Date(log.start_time).toLocaleDateString()}</div>
                                        <div className="text-xs text-muted-foreground">{new Date(log.start_time).toLocaleTimeString()}</div>
                                    </TableCell>
                                    <TableCell>{log.call_type}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={getStatusColor(log.status)}>
                                            {log.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{log.duration}s</TableCell>
                                    <TableCell>{log.owner}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Simple Pagination */}
            <div className="flex items-center justify-center gap-2 mt-4">
                {page > 1 && (
                    <Button variant="outline" asChild>
                        <Link href={`?page=${page - 1}`}>Previous</Link>
                    </Button>
                )}
                <Button variant="outline" disabled>{page}</Button>
                <Button variant="outline" asChild>
                    <Link href={`?page=${page + 1}`}>Next</Link>
                </Button>
            </div>
        </div>
    );
}
