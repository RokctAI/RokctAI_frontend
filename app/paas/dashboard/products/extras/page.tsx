"use client";

import { Loader2, Plus, Pencil, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getExtraGroups, createExtraGroup, updateExtraGroup, deleteExtraGroup, getExtraValues, createExtraValue, deleteExtraValue } from "@/app/actions/paas/extras";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export default function ExtrasPage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
    const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<any>(null);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [processing, setProcessing] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [groupValues, setGroupValues] = useState<Record<string, any[]>>({});

    const [groupForm, setGroupForm] = useState({ name: "" });
    const [valueForm, setValueForm] = useState({ value: "", price: 0 });

    useEffect(() => {
        fetchGroups();
    }, []);

    async function fetchGroups() {
        try {
            const data = await getExtraGroups();
            setGroups(data);
        } catch (error) {
            console.error("Error fetching groups:", error);
            toast.error("Failed to load extra groups");
        } finally {
            setLoading(false);
        }
    }

    async function fetchValues(groupId: string) {
        try {
            const values = await getExtraValues(groupId);
            setGroupValues(prev => ({ ...prev, [groupId]: values }));
        } catch (error) {
            console.error("Error fetching values:", error);
        }
    }

    const toggleGroup = (groupId: string) => {
        if (expandedGroups.includes(groupId)) {
            setExpandedGroups(prev => prev.filter(id => id !== groupId));
        } else {
            setExpandedGroups(prev => [...prev, groupId]);
            if (!groupValues[groupId]) {
                fetchValues(groupId);
            }
        }
    };

    const handleGroupSubmit = async () => {
        if (!groupForm.name) {
            toast.error("Group name is required");
            return;
        }

        setProcessing(true);
        try {
            if (editingGroup) {
                await updateExtraGroup(editingGroup.name, groupForm);
                toast.success("Group updated successfully");
            } else {
                await createExtraGroup(groupForm);
                toast.success("Group created successfully");
            }
            setIsGroupDialogOpen(false);
            fetchGroups();
        } catch (error) {
            console.error("Error saving group:", error);
            toast.error("Failed to save group");
        } finally {
            setProcessing(false);
        }
    };

    const handleValueSubmit = async () => {
        if (!valueForm.value) {
            toast.error("Value name is required");
            return;
        }

        setProcessing(true);
        try {
            await createExtraValue({
                value: valueForm.value,
                price: valueForm.price,
                extra_group: selectedGroup.name
            });
            toast.success("Value added successfully");
            setIsValueDialogOpen(false);
            fetchValues(selectedGroup.name);
        } catch (error) {
            console.error("Error saving value:", error);
            toast.error("Failed to save value");
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteGroup = async (name: string) => {
        if (!confirm("Are you sure you want to delete this group?")) return;
        try {
            await deleteExtraGroup(name);
            toast.success("Group deleted successfully");
            fetchGroups();
        } catch (error) {
            console.error("Error deleting group:", error);
            toast.error("Failed to delete group");
        }
    };

    const handleDeleteValue = async (name: string, groupId: string) => {
        if (!confirm("Are you sure you want to delete this value?")) return;
        try {
            await deleteExtraValue(name);
            toast.success("Value deleted successfully");
            fetchValues(groupId);
        } catch (error) {
            console.error("Error deleting value:", error);
            toast.error("Failed to delete value");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Product Extras</h1>
                    <p className="text-muted-foreground">Manage product add-ons and variants (e.g., Sizes, Toppings).</p>
                </div>
                <Button onClick={() => {
                    setEditingGroup(null);
                    setGroupForm({ name: "" });
                    setIsGroupDialogOpen(true);
                }}>
                    <Plus className="mr-2 size-4" />
                    Add Group
                </Button>
            </div>

            <div className="grid gap-4">
                {groups.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No extra groups found. Create one to get started.
                        </CardContent>
                    </Card>
                ) : (
                    groups.map((group) => (
                        <Card key={group.name}>
                            <Collapsible
                                open={expandedGroups.includes(group.name)}
                                onOpenChange={() => toggleGroup(group.name)}
                            >
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-4">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                {expandedGroups.includes(group.name) ? (
                                                    <ChevronDown className="size-4" />
                                                ) : (
                                                    <ChevronRight className="size-4" />
                                                )}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <span className="font-medium text-lg">{group.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedGroup(group);
                                                setValueForm({ value: "", price: 0 });
                                                setIsValueDialogOpen(true);
                                            }}
                                        >
                                            <Plus className="mr-2 size-4" />
                                            Add Value
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setEditingGroup(group);
                                                setGroupForm({ name: group.name });
                                                setIsGroupDialogOpen(true);
                                            }}
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600"
                                            onClick={() => handleDeleteGroup(group.name)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CollapsibleContent>
                                    <div className="px-4 pb-4 pt-0">
                                        <div className="rounded-md border p-4 bg-muted/50">
                                            {groupValues[group.name]?.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {groupValues[group.name].map((val) => (
                                                        <div key={val.name} className="flex items-center justify-between bg-background p-3 rounded border">
                                                            <div>
                                                                <div className="font-medium">{val.value}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    +${val.price.toFixed(2)}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8 text-red-500"
                                                                onClick={() => handleDeleteValue(val.name, group.name)}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-2">
                                                    No values added yet.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>
                    ))
                )}
            </div>

            {/* Group Dialog */}
            <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingGroup ? "Edit Group" : "Add Group"}</DialogTitle>
                        <DialogDescription>
                            Create a group for extras (e.g., "Size", "Toppings").
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="groupName">Group Name</Label>
                        <Input
                            id="groupName"
                            value={groupForm.name}
                            onChange={(e) => setGroupForm({ name: e.target.value })}
                            placeholder="e.g. Size"
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleGroupSubmit} disabled={processing}>
                            {processing ? <Loader2 className="size-4 animate-spin" /> : "Save Group"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Value Dialog */}
            <Dialog open={isValueDialogOpen} onOpenChange={setIsValueDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Value to {selectedGroup?.name}</DialogTitle>
                        <DialogDescription>
                            Add an option to this group (e.g., "Small", "Cheese").
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="valueName">Value Name</Label>
                            <Input
                                id="valueName"
                                value={valueForm.value}
                                onChange={(e) => setValueForm(prev => ({ ...prev, value: e.target.value }))}
                                placeholder="e.g. Small"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="price">Additional Price</Label>
                            <Input
                                id="price"
                                type="number"
                                value={valueForm.price}
                                onChange={(e) => setValueForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleValueSubmit} disabled={processing}>
                            {processing ? <Loader2 className="size-4 animate-spin" /> : "Add Value"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
