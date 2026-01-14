"use client";

import { useState, useEffect } from "react";
import { getWorkItems, WorkItemType } from "@/app/actions/handson/all/workspace/dashboard";
import { WorkItemCard } from "@/components/handson/work-item-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export function UnifiedWorkspace() {
    const [loading, setLoading] = useState(true);
    const [allItems, setAllItems] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all types in parallel
                const [todos, tasks, notes] = await Promise.all([
                    getWorkItems('todo'),
                    getWorkItems('task'),
                    getWorkItems('note')
                ]);

                // Combine and sort by date (newest first, or by due date)
                const combined = [...todos, ...tasks, ...notes].sort((a, b) => {
                    // Sort by modification or creation if available, else name
                    return b.creation > a.creation ? 1 : -1;
                });

                setAllItems(combined);
            } catch (e) {
                console.error("Failed to fetch workspace items", e);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    const todos = allItems.filter(i => i.type === 'todo');
    const tasks = allItems.filter(i => i.type === 'task');
    const notes = allItems.filter(i => i.type === 'note');

    // CRM Filter: Items linked to CRM DocTypes
    const crmItems = allItems.filter(i =>
        ['Lead', 'Opportunity', 'Customer', 'Contact', 'Prospect'].includes(i.reference_type)
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Workspace</h1>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Work Item</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={createType} onValueChange={(v: any) => setCreateType(v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">ToDo</SelectItem>
                                        <SelectItem value="task">Task</SelectItem>
                                        <SelectItem value="note">Note</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>{createType === 'note' ? 'Title' : 'Description'}</Label>
                                <Input
                                    placeholder={createType === 'note' ? 'Note Title' : 'What needs to be done?'}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {createType !== 'note' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Priority</Label>
                                        <Select value={priority} onValueChange={setPriority}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Low">Low</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="High">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Due Date</Label>
                                        <Input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <Button onClick={handleCreate} disabled={creating} className="w-full mt-4">
                                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">All Items ({allItems.length})</TabsTrigger>
                    <TabsTrigger value="crm">CRM ({crmItems.length})</TabsTrigger>
                    <TabsTrigger value="todos">ToDos ({todos.length})</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
                    <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allItems.map((item, idx) => (
                            <WorkItemCard key={`${item.type}-${item.name}-${idx}`} item={item} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="crm" className="space-y-4">
                    {crmItems.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg">
                            No CRM tasks found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {crmItems.map((item, idx) => (
                                <WorkItemCard key={`${item.type}-${item.name}-${idx}`} item={item} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="todos">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {todos.map((item, idx) => (
                            <WorkItemCard key={`${item.type}-${item.name}-${idx}`} item={item} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="tasks">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tasks.map((item, idx) => (
                            <WorkItemCard key={`${item.type}-${item.name}-${idx}`} item={item} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="notes">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {notes.map((item, idx) => (
                            <WorkItemCard key={`${item.type}-${item.name}-${idx}`} item={item} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
