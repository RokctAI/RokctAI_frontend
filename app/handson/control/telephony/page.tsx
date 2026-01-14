"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    getTelephonySettings,
    getTelephonyCustomers,
    getTelephonySubscriptions,
    getTelephonyTransactions,
    getAvailableDIDs,
    deleteTelephonyCustomer,
    deleteTelephonySubscription,
    deleteAvailableDID
} from "@/app/actions/handson/control/telephony/telephony";

export default function TelephonyPage() {
    const [settings, setSettings] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [dids, setDids] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchData() {
        setLoading(true);
        try {
            const [settingsData, customersData, subsData, transData, didsData] = await Promise.all([
                getTelephonySettings(),
                getTelephonyCustomers(),
                getTelephonySubscriptions(),
                getTelephonyTransactions(),
                getAvailableDIDs()
            ]);
            setSettings(settingsData || []);
            setCustomers(customersData || []);
            setSubscriptions(subsData || []);
            setTransactions(transData || []);
            setDids(didsData || []);
        } catch (error) {
            console.error("Error fetching telephony data:", error);
            toast.error("Failed to fetch telephony data");
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteCustomer(name: string) {
        if (!confirm("Are you sure you want to delete this customer?")) return;
        try {
            await deleteTelephonyCustomer(name);
            toast.success("Customer deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete customer");
        }
    }

    async function handleDeleteSubscription(name: string) {
        if (!confirm("Are you sure you want to delete this subscription?")) return;
        try {
            await deleteTelephonySubscription(name);
            toast.success("Subscription deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete subscription");
        }
    }

    async function handleDeleteDID(name: string) {
        if (!confirm("Are you sure you want to delete this DID?")) return;
        try {
            await deleteAvailableDID(name);
            toast.success("DID deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete DID");
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Telephony Management</h1>
                    <p className="text-muted-foreground">Manage telephony settings, customers, and DIDs.</p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchData} title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            <Tabs defaultValue="settings">
                <TabsList className="flex-wrap h-auto">
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="dids">Available DIDs</TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Telephony Settings</CardTitle>
                            <CardDescription>Global telephony configuration.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Provider</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {settings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                                                No settings found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        settings.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.provider}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="customers" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Telephony Customers</CardTitle>
                            <CardDescription>Registered telephony customers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Customer Name</TableHead>
                                        <TableHead>Phone Number</TableHead>
                                        <TableHead>Phone Number</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No customers found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        customers.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.customer_name}</TableCell>
                                                <TableCell>{item.phone_number}</TableCell>
                                                <TableCell>{item.status}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteCustomer(item.name)}>
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

                <TabsContent value="subscriptions" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Telephony Subscriptions</CardTitle>
                            <CardDescription>Active telephony subscriptions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subscriptions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No subscriptions found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        subscriptions.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.customer}</TableCell>
                                                <TableCell>{item.plan}</TableCell>
                                                <TableCell>{item.status}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteSubscription(item.name)}>
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

                <TabsContent value="transactions" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Telephony Transactions</CardTitle>
                            <CardDescription>Call and SMS transactions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No transactions found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        transactions.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.type}</TableCell>
                                                <TableCell>{item.amount}</TableCell>
                                                <TableCell>{item.date ? format(new Date(item.date), "MMM d, yyyy") : "-"}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dids" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Available DIDs</CardTitle>
                            <CardDescription>List of available phone numbers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>DID Number</TableHead>
                                        <TableHead>Country</TableHead>
                                        <TableHead>Country</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dids.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No DIDs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        dids.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.did_number}</TableCell>
                                                <TableCell>{item.country}</TableCell>
                                                <TableCell>{item.status}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteDID(item.name)}>
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
        </div>
    );
}
