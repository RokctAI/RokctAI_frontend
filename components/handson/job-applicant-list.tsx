"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, User, Search } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { getJobApplicants } from "@/app/actions/handson/all/hrms/recruitment";

export function JobApplicantList() {
    const router = useRouter();
    const [applicants, setApplicants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadApplicants();
    }, []);

    async function loadApplicants() {
        setLoading(true);
        const data = await getJobApplicants();
        setApplicants(data);
        setLoading(false);
    }

    const filteredApplicants = applicants.filter(app =>
        app.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
        app.job_title?.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "Open": return "outline";
            case "Replied": return "secondary";
            case "Accepted": return "default";
            case "Rejected": return "destructive";
            case "Hold": return "secondary";
            default: return "outline";
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search candidates..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button onClick={() => router.push("/handson/all/hr/recruitment/candidates/new")}>
                    <Plus className="mr-2 h-4 w-4" /> Add Candidate
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Candidate Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Applied For</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Applied On</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : filteredApplicants.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No candidates found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredApplicants.map((app) => (
                                <TableRow key={app.name} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            {app.applicant_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{app.email_id}</TableCell>
                                    <TableCell>{app.job_title}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(app.status)}>
                                            {app.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{app.creation?.split(" ")[0]}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
