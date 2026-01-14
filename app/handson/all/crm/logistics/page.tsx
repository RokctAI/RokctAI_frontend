"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Map, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import {
    getCompetitorRoutes, createCompetitorRoute, deleteCompetitorRoute,
    getCompetitorZones, createCompetitorZone, deleteCompetitorZone
} from "@/app/actions/handson/all/crm/competitor";

// --- Schemas ---

const routeSchema = z.object({
    route_name: z.string().min(2, "Name is required"),
    route_type: z.enum(["Primary", "Secondary"]),
    route_path: z.string().optional()
});

const zoneSchema = z.object({
    zone_name: z.string().min(2, "Name is required"),
    zone_path: z.string().optional()
});

export default function LogisticsPage() {
    const [activeTab, setActiveTab] = useState("routes");
    const [loading, setLoading] = useState(true);

    // Data
    const [routes, setRoutes] = useState<any[]>([]);
    const [zones, setZones] = useState<any[]>([]);

    // Dialogs
    const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
    const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);

    // Forms
    const routeForm = useForm<z.infer<typeof routeSchema>>({
        resolver: zodResolver(routeSchema),
        defaultValues: { route_name: "", route_type: "Primary", route_path: "" }
    });

    const zoneForm = useForm<z.infer<typeof zoneSchema>>({
        resolver: zodResolver(zoneSchema),
        defaultValues: { zone_name: "", zone_path: "" }
    });

    async function fetchData() {
        setLoading(true);
        try {
            const [rData, zData] = await Promise.all([
                getCompetitorRoutes(),
                getCompetitorZones()
            ]);
            setRoutes(rData || []);
            setZones(zData || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch logistics data");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    // --- Route Handlers ---

    const onRouteSubmit = async (values: z.infer<typeof routeSchema>) => {
        try {
            await createCompetitorRoute(values);
            toast.success("Route created");
            setIsRouteDialogOpen(false);
            routeForm.reset();
            fetchData();
        } catch (error) {
            toast.error("Failed to create route");
        }
    };

    const onDeleteRoute = async (name: string) => {
        if (!confirm("Delete route?")) return;
        try {
            await deleteCompetitorRoute(name);
            toast.success("Route deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete route");
        }
    };

    // --- Zone Handlers ---

    const onZoneSubmit = async (values: z.infer<typeof zoneSchema>) => {
        try {
            await createCompetitorZone(values);
            toast.success("Zone created");
            setIsZoneDialogOpen(false);
            zoneForm.reset();
            fetchData();
        } catch (error) {
            toast.error("Failed to create zone");
        }
    };

    const onDeleteZone = async (name: string) => {
        if (!confirm("Delete zone?")) return;
        try {
            await deleteCompetitorZone(name);
            toast.success("Zone deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete zone");
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
                    <h1 className="text-3xl font-bold">Competitor Logistics</h1>
                    <p className="text-muted-foreground">Manage service routes and operational zones.</p>
                </div>
            </div>

            <Tabs defaultValue="routes" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="routes">Routes</TabsTrigger>
                    <TabsTrigger value="zones">Zones</TabsTrigger>
                </TabsList>

                {/* --- Routes Tab --- */}
                <TabsContent value="routes" className="space-y-4 mt-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setIsRouteDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Route</Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Competitor Routes</CardTitle>
                            <CardDescription>Tracked logistics paths.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Route Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Path Details</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {routes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No routes found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        routes.map((route) => (
                                            <TableRow key={route.name}>
                                                <TableCell className="font-medium flex items-center gap-2">
                                                    <Map className="h-4 w-4 text-blue-500" />
                                                    {route.route_name}
                                                </TableCell>
                                                <TableCell>{route.route_type}</TableCell>
                                                <TableCell className="max-w-[300px] truncate">{route.route_path || "-"}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => onDeleteRoute(route.name)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Zones Tab --- */}
                <TabsContent value="zones" className="space-y-4 mt-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setIsZoneDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Zone</Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Competitor Zones</CardTitle>
                            <CardDescription>Defined operational territories.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Zone Name</TableHead>
                                        <TableHead>Area Details</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {zones.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                No zones found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        zones.map((zone) => (
                                            <TableRow key={zone.name}>
                                                <TableCell className="font-medium flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-orange-500" />
                                                    {zone.zone_name}
                                                </TableCell>
                                                <TableCell className="max-w-[300px] truncate">{zone.zone_path || "-"}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => onDeleteZone(zone.name)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* --- Route Dialog --- */}
            <Dialog open={isRouteDialogOpen} onOpenChange={setIsRouteDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Create Route</DialogTitle></DialogHeader>
                    <Form {...routeForm}>
                        <form onSubmit={routeForm.handleSubmit(onRouteSubmit)} className="space-y-4">
                            <FormField control={routeForm.control} name="route_name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={routeForm.control} name="route_type" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Primary">Primary</SelectItem>
                                            <SelectItem value="Secondary">Secondary</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <FormField control={routeForm.control} name="route_path" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Path / Description</FormLabel>
                                    <FormControl><Textarea {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* --- Zone Dialog --- */}
            <Dialog open={isZoneDialogOpen} onOpenChange={setIsZoneDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Create Zone</DialogTitle></DialogHeader>
                    <Form {...zoneForm}>
                        <form onSubmit={zoneForm.handleSubmit(onZoneSubmit)} className="space-y-4">
                            <FormField control={zoneForm.control} name="zone_name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={zoneForm.control} name="zone_path" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Boundaries / Description</FormLabel>
                                    <FormControl><Textarea {...field} /></FormControl>
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
