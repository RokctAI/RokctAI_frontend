"use client";

import { Loader2, Plus, Pencil, Trash2, Armchair } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getShopSections, createShopSection, updateShopSection, deleteShopSection, getTables, createTable, updateTable, deleteTable } from "@/app/actions/paas/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TablesPage() {
    const [sections, setSections] = useState<any[]>([]);
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);

    // Dialog states
    const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
    const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<any>(null);
    const [editingTable, setEditingTable] = useState<any>(null);
    const [processing, setProcessing] = useState(false);

    // Form states
    const [sectionName, setSectionName] = useState("");
    const [tableName, setTableName] = useState("");
    const [tableCapacity, setTableCapacity] = useState("");

    useEffect(() => {
        fetchSections();
    }, []);

    useEffect(() => {
        if (selectedSection) {
            fetchTables(selectedSection);
        } else {
            setTables([]);
        }
    }, [selectedSection]);

    async function fetchSections() {
        try {
            const data = await getShopSections();
            setSections(data);
            if (data.length > 0 && !selectedSection) {
                setSelectedSection(data[0].name);
            }
        } catch (error) {
            console.error("Error fetching sections:", error);
            toast.error("Failed to load zones");
        } finally {
            setLoading(false);
        }
    }

    async function fetchTables(sectionId: string) {
        try {
            const data = await getTables(sectionId);
            setTables(data);
        } catch (error) {
            console.error("Error fetching tables:", error);
            toast.error("Failed to load tables");
        }
    }

    // Section Handlers
    const handleOpenSectionDialog = (section?: any) => {
        if (section) {
            setEditingSection(section);
            setSectionName(section.section_name);
        } else {
            setEditingSection(null);
            setSectionName("");
        }
        setIsSectionDialogOpen(true);
    };

    const handleSectionSubmit = async () => {
        if (!sectionName) {
            toast.error("Zone name is required");
            return;
        }

        setProcessing(true);
        try {
            if (editingSection) {
                await updateShopSection(editingSection.name, { section_name: sectionName });
                toast.success("Zone updated successfully");
            } else {
                await createShopSection({ section_name: sectionName });
                toast.success("Zone created successfully");
            }
            setIsSectionDialogOpen(false);
            fetchSections();
        } catch (error) {
            console.error("Error saving zone:", error);
            toast.error("Failed to save zone");
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteSection = async (name: string) => {
        if (!confirm("Are you sure? This will delete all tables in this zone.")) return;
        try {
            await deleteShopSection(name);
            toast.success("Zone deleted successfully");
            fetchSections();
            setSelectedSection(null);
        } catch (error) {
            console.error("Error deleting zone:", error);
            toast.error("Failed to delete zone");
        }
    };

    // Table Handlers
    const handleOpenTableDialog = (table?: any) => {
        if (table) {
            setEditingTable(table);
            setTableName(table.table_number);
            setTableCapacity(table.capacity);
        } else {
            setEditingTable(null);
            setTableName("");
            setTableCapacity("");
        }
        setIsTableDialogOpen(true);
    };

    const handleTableSubmit = async () => {
        if (!tableName || !tableCapacity) {
            toast.error("Table number and capacity are required");
            return;
        }

        if (!selectedSection) {
            toast.error("No zone selected");
            return;
        }

        setProcessing(true);
        try {
            const data = {
                table_number: tableName,
                capacity: parseInt(tableCapacity),
                shop_section: selectedSection
            };

            if (editingTable) {
                await updateTable(editingTable.name, data);
                toast.success("Table updated successfully");
            } else {
                await createTable(data);
                toast.success("Table created successfully");
            }
            setIsTableDialogOpen(false);
            fetchTables(selectedSection);
        } catch (error) {
            console.error("Error saving table:", error);
            toast.error("Failed to save table");
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteTable = async (name: string) => {
        if (!confirm("Are you sure you want to delete this table?")) return;
        try {
            await deleteTable(name);
            toast.success("Table deleted successfully");
            if (selectedSection) fetchTables(selectedSection);
        } catch (error) {
            console.error("Error deleting table:", error);
            toast.error("Failed to delete table");
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
                    <h1 className="text-3xl font-bold">Tables & Zones</h1>
                    <p className="text-muted-foreground">Manage your shop's seating layout.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Zones Sidebar */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">Zones</CardTitle>
                        <Button size="sm" variant="ghost" onClick={() => handleOpenSectionDialog()}>
                            <Plus className="size-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-2">
                            {sections.map((section) => (
                                <div
                                    key={section.name}
                                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent ${selectedSection === section.name ? "bg-accent" : ""}`}
                                    onClick={() => setSelectedSection(section.name)}
                                >
                                    <span className="font-medium">{section.section_name}</span>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="size-6" onClick={(e) => { e.stopPropagation(); handleOpenSectionDialog(section); }}>
                                            <Pencil className="size-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="size-6 text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.name); }}>
                                            <Trash2 className="size-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {sections.length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-4">No zones created.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Tables Content */}
                <Card className="md:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Tables</CardTitle>
                            <CardDescription>
                                {selectedSection ? `Managing tables in ${sections.find(s => s.name === selectedSection)?.section_name}` : "Select a zone to view tables"}
                            </CardDescription>
                        </div>
                        {selectedSection && (
                            <Button onClick={() => handleOpenTableDialog()}>
                                <Plus className="mr-2 size-4" />
                                Add Table
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {!selectedSection ? (
                            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                <Armchair className="size-12 mb-4 opacity-20" />
                                <p>Select a zone to manage tables</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Table Number</TableHead>
                                        <TableHead>Capacity</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tables.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                No tables found in this zone.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        tables.map((table) => (
                                            <TableRow key={table.name}>
                                                <TableCell className="font-medium">{table.table_number}</TableCell>
                                                <TableCell>{table.capacity} Guests</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenTableDialog(table)}>
                                                        <Pencil className="size-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteTable(table.name)}>
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Zone Dialog */}
            <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSection ? "Edit Zone" : "Create Zone"}</DialogTitle>
                        <DialogDescription>
                            Create a new zone (e.g., "Main Hall", "Patio") for your shop.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sectionName" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="sectionName"
                                value={sectionName}
                                onChange={(e) => setSectionName(e.target.value)}
                                className="col-span-3"
                                placeholder="Main Hall"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSectionSubmit} disabled={processing}>
                            {processing ? <Loader2 className="size-4 animate-spin" /> : (editingSection ? "Update Zone" : "Create Zone")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Table Dialog */}
            <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTable ? "Edit Table" : "Add Table"}</DialogTitle>
                        <DialogDescription>
                            Add a new table to the selected zone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tableName" className="text-right">
                                Number/Name
                            </Label>
                            <Input
                                id="tableName"
                                value={tableName}
                                onChange={(e) => setTableName(e.target.value)}
                                className="col-span-3"
                                placeholder="T-01"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tableCapacity" className="text-right">
                                Capacity
                            </Label>
                            <Input
                                id="tableCapacity"
                                type="number"
                                value={tableCapacity}
                                onChange={(e) => setTableCapacity(e.target.value)}
                                className="col-span-3"
                                placeholder="4"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleTableSubmit} disabled={processing}>
                            {processing ? <Loader2 className="size-4 animate-spin" /> : (editingTable ? "Update Table" : "Add Table")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
