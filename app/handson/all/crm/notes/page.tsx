import React from "react";
import { getNotes } from "@/app/actions/handson/all/crm/notes";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { StickyNote, Plus, Calendar } from "lucide-react";

export default async function NotesPage({ searchParams }: { searchParams: { page?: string } }) {
    const page = parseInt(searchParams.page || "1");
    const result = await getNotes(page);
    const notes = result.data || [];

    const getInitials = (name: string) => (name || "?").substring(0, 2).toUpperCase();

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
                    <p className="text-muted-foreground">Manage your personal and shared notes</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Note
                </Button>
            </div>

            {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/10 h-64">
                    <StickyNote className="w-10 h-10 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No notes found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {notes.map((note: any) => (
                        <Card key={note.name} className="flex flex-col h-56 hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="pb-2">
                                <CardTitle className="truncate font-medium text-lg leading-tight">
                                    {note.title || "Untitled"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden pb-2">
                                <div
                                    className="text-sm text-muted-foreground line-clamp-5 prose-sm"
                                    dangerouslySetInnerHTML={{ __html: note.content || "" }}
                                />
                            </CardContent>
                            <CardFooter className="pt-2 border-t flex justify-between items-center bg-muted/20 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Avatar className="w-5 h-5">
                                        <AvatarFallback className="text-[10px]">{getInitials(note.owner)}</AvatarFallback>
                                    </Avatar>
                                    <span className="truncate max-w-[80px]">{note.owner}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(note.modified).toLocaleDateString()}</span>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

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
