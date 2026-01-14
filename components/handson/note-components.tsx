"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { createNote } from "@/app/actions/handson/all/crm/support/note"; // Importing from commercial as per decision
import { toast } from "sonner";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NoteList({ notes }: { notes: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const filtered = notes.filter(n => n.title?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-2xl font-bold">CRM Notes</h1><p className="text-muted-foreground">Log interactions and internal notes.</p></div>
                <div className="flex gap-4">
                    <Link href="/handson/all/commercial/crm/note/new"><Button><Plus className="mr-2 h-4 w-4" /> New Note</Button></Link>
                </div>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Public</TableHead><TableHead>Last Modified</TableHead><TableHead></TableHead></TableRow></TableHeader>
                    <TableBody>
                        {filtered.map(n => (
                            <TableRow key={n.name}>
                                <TableCell className="font-medium flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{n.title}</TableCell>
                                <TableCell>{n.public ? "Yes" : "No"}</TableCell>
                                <TableCell>{n.modified}</TableCell>
                                <TableCell>
                                    {/* View/Edit Link could go here */}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export function NoteForm() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const handleSubmit = async () => {
        const res = await createNote({ title, content, public: false });
        if (res.success) { toast.success("Note Created"); router.push("/handson/all/commercial/crm/note"); }
        else toast.error(res.error);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex justify-between"><h1 className="text-2xl font-bold">New Note</h1><Button onClick={handleSubmit}>Save Note</Button></div>
            <Card>
                <CardContent className="space-y-4 pt-4">
                    <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Subject" /></div>
                    <div><Label>Content</Label><Textarea value={content} onChange={e => setContent(e.target.value)} rows={6} placeholder="Details..." /></div>
                </CardContent>
            </Card>
        </div>
    );
}
