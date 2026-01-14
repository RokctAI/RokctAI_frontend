"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getLanguages } from "@/app/actions/paas/admin/system";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function LanguagesPage() {
    const [languages, setLanguages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLanguages() {
            try {
                const data = await getLanguages();
                setLanguages(data);
            } catch (error) {
                console.error("Error fetching languages:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLanguages();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Languages</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Language</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Active</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    <Loader2 className="size-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : languages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No languages found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            languages.map((lang) => (
                                <TableRow key={lang.name}>
                                    <TableCell className="font-medium">{lang.language_name}</TableCell>
                                    <TableCell>{lang.language_code}</TableCell>
                                    <TableCell>
                                        <Badge variant={lang.enabled ? "default" : "secondary"}>
                                            {lang.enabled ? "Active" : "Inactive"}
                                        </Badge>
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
