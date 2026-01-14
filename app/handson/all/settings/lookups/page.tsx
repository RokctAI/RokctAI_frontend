"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, MapPin, Building, LandPlot } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import {
    getProvinces, createProvince, deleteProvince,
    getLocationTypes, createLocationType, deleteLocationType,
    getOrgans, createOrgan, deleteOrgan
} from "@/app/actions/handson/all/settings/lookups";
import { getIndustries } from "@/app/actions/handson/all/crm/competitor";

// --- Schemas ---

const provinceSchema = z.object({
    province_name: z.string().min(2, "Name is required")
});

const locationTypeSchema = z.object({
    location_type_name: z.string().min(2, "Name is required"),
    industry: z.string().min(1, "Industry is required")
});

const organSchema = z.object({
    organ_name: z.string().min(2, "Name is required"),
    type: z.enum(["National Department", "Provincial Department", "Municipality", "State Owned Entity"])
});

export default function LookupsPage() {
    const [activeTab, setActiveTab] = useState("provinces");
    const [loading, setLoading] = useState(true);

    // Data
    const [provinces, setProvinces] = useState<any[]>([]);
    const [locationTypes, setLocationTypes] = useState<any[]>([]);
    const [organs, setOrgans] = useState<any[]>([]);
    const [industries, setIndustries] = useState<any[]>([]);

    // Dialogs
    const [isProvinceDialogOpen, setIsProvinceDialogOpen] = useState(false);
    const [isLocTypeDialogOpen, setIsLocTypeDialogOpen] = useState(false);
    const [isOrganDialogOpen, setIsOrganDialogOpen] = useState(false);

    // Forms
    const provForm = useForm<z.infer<typeof provinceSchema>>({
        resolver: zodResolver(provinceSchema),
        defaultValues: { province_name: "" }
    });

    const locForm = useForm<z.infer<typeof locationTypeSchema>>({
        resolver: zodResolver(locationTypeSchema),
        defaultValues: { location_type_name: "", industry: "" }
    });

    const organForm = useForm<z.infer<typeof organSchema>>({
        resolver: zodResolver(organSchema),
        defaultValues: { organ_name: "", type: "National Department" }
    });

    async function fetchData() {
        setLoading(true);
        try {
            const [pData, lData, oData, iData] = await Promise.all([
                getProvinces(),
                getLocationTypes(),
                getOrgans(),
                getIndustries()
            ]);
            setProvinces(pData || []);
            setLocationTypes(lData || []);
            setOrgans(oData || []);
            setIndustries(iData || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch lookup data");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    // --- Handlers ---

    const onProvSubmit = async (values: z.infer<typeof provinceSchema>) => {
        try {
            await createProvince(values);
            toast.success("Province created");
            setIsProvinceDialogOpen(false);
            provForm.reset();
            fetchData();
        } catch (error) {
            toast.error("Failed to create province");
        }
    };

    const onLocSubmit = async (values: z.infer<typeof locationTypeSchema>) => {
        try {
            await createLocationType(values);
            toast.success("Location Type created");
            setIsLocTypeDialogOpen(false);
            locForm.reset();
            fetchData();
        } catch (error) {
            toast.error("Failed to create location type");
        }
    };

    const onOrganSubmit = async (values: z.infer<typeof organSchema>) => {
        try {
            await createOrgan(values);
            toast.success("Organ created");
            setIsOrganDialogOpen(false);
            organForm.reset();
            fetchData();
        } catch (error) {
            toast.error("Failed to create organ");
        }
    };

    const onDelete = async (type: "province" | "location" | "organ", name: string) => {
        if (!confirm("Delete this item?")) return;
        try {
            if (type === "province") await deleteProvince(name);
            if (type === "location") await deleteLocationType(name);
            if (type === "organ") await deleteOrgan(name);
            toast.success("Deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete");
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
                    <h1 className="text-3xl font-bold">System Lookups</h1>
                    <p className="text-muted-foreground">Manage reference data lists.</p>
                </div>
            </div>

            <Tabs defaultValue="provinces" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="provinces">Provinces</TabsTrigger>
                    <TabsTrigger value="locations">Location Types</TabsTrigger>
                    <TabsTrigger value="organs">Organs of State</TabsTrigger>
                </TabsList>

                {/* --- Provinces --- */}
                <TabsContent value="provinces" className="space-y-4 mt-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setIsProvinceDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Province</Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Provinces</CardTitle>
                            <CardDescription>Geographic regions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {provinces.map((prov) => (
                                        <TableRow key={prov.name}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-blue-500" />
                                                {prov.province_name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => onDelete("province", prov.name)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Location Types --- */}
                <TabsContent value="locations" className="space-y-4 mt-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setIsLocTypeDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Type</Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Location Types</CardTitle>
                            <CardDescription>Classifications for locations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Industry</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {locationTypes.map((loc) => (
                                        <TableRow key={loc.name}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <LandPlot className="h-4 w-4 text-green-500" />
                                                {loc.location_type_name}
                                            </TableCell>
                                            <TableCell>{loc.industry}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => onDelete("location", loc.name)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Organs of State --- */}
                <TabsContent value="organs" className="space-y-4 mt-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setIsOrganDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Entity</Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Organs of State</CardTitle>
                            <CardDescription>Government entities and institutions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {organs.map((org) => (
                                        <TableRow key={org.name}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <Building className="h-4 w-4 text-orange-500" />
                                                {org.organ_name}
                                            </TableCell>
                                            <TableCell>{org.type}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => onDelete("organ", org.name)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* --- Dialogs --- */}

            <Dialog open={isProvinceDialogOpen} onOpenChange={setIsProvinceDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>New Province</DialogTitle></DialogHeader>
                    <Form {...provForm}>
                        <form onSubmit={provForm.handleSubmit(onProvSubmit)} className="space-y-4">
                            <FormField control={provForm.control} name="province_name" render={({ field }) => (
                                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={isLocTypeDialogOpen} onOpenChange={setIsLocTypeDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>New Location Type</DialogTitle></DialogHeader>
                    <Form {...locForm}>
                        <form onSubmit={locForm.handleSubmit(onLocSubmit)} className="space-y-4">
                            <FormField control={locForm.control} name="location_type_name" render={({ field }) => (
                                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={locForm.control} name="industry" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Industry</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {industries.map((i) => <SelectItem key={i.name} value={i.name}>{i.industry_name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={isOrganDialogOpen} onOpenChange={setIsOrganDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>New Organ of State</DialogTitle></DialogHeader>
                    <Form {...organForm}>
                        <form onSubmit={organForm.handleSubmit(onOrganSubmit)} className="space-y-4">
                            <FormField control={organForm.control} name="organ_name" render={({ field }) => (
                                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={organForm.control} name="type" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="National Department">National Department</SelectItem>
                                            <SelectItem value="Provincial Department">Provincial Department</SelectItem>
                                            <SelectItem value="Municipality">Municipality</SelectItem>
                                            <SelectItem value="State Owned Entity">State Owned Entity</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
