"use client";

import { Loader2, Users, ChefHat, Bike } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getWaiters, getCooks, getDeliveryMen } from "@/app/actions/paas/staff";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StaffPage() {
    const [waiters, setWaiters] = useState<any[]>([]);
    const [cooks, setCooks] = useState<any[]>([]);
    const [deliveryMen, setDeliveryMen] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllStaff();
    }, []);

    async function fetchAllStaff() {
        try {
            const [waitersData, cooksData, deliveryData] = await Promise.all([
                getWaiters(),
                getCooks(),
                getDeliveryMen()
            ]);
            setWaiters(waitersData);
            setCooks(cooksData);
            setDeliveryMen(deliveryData);
        } catch (error) {
            console.error("Error fetching staff:", error);
            toast.error("Failed to load staff");
        } finally {
            setLoading(false);
        }
    }

    const StaffList = ({ staff, emptyMessage }: { staff: any[], emptyMessage: string }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                    {emptyMessage}
                </div>
            ) : (
                staff.map((member) => (
                    <Card key={member.name}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="size-12">
                                    <AvatarImage src={member.user_image} alt={member.full_name} />
                                    <AvatarFallback>{member.full_name?.charAt(0) || member.email.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{member.full_name || member.email}</h3>
                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Staff Management</h1>
                <p className="text-muted-foreground">Manage your restaurant staff members.</p>
            </div>

            <Tabs defaultValue="waiters" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="waiters" className="flex items-center gap-2">
                        <Users className="size-4" />
                        Waiters ({waiters.length})
                    </TabsTrigger>
                    <TabsTrigger value="cooks" className="flex items-center gap-2">
                        <ChefHat className="size-4" />
                        Cooks ({cooks.length})
                    </TabsTrigger>
                    <TabsTrigger value="delivery" className="flex items-center gap-2">
                        <Bike className="size-4" />
                        Delivery ({deliveryMen.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="waiters">
                    <Card>
                        <CardHeader>
                            <CardTitle>Waiters</CardTitle>
                            <CardDescription>Staff members serving customers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StaffList staff={waiters} emptyMessage="No waiters found." />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cooks">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cooks</CardTitle>
                            <CardDescription>Kitchen staff preparing orders.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StaffList staff={cooks} emptyMessage="No cooks found." />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="delivery">
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Personnel</CardTitle>
                            <CardDescription>Staff members delivering orders.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StaffList staff={deliveryMen} emptyMessage="No delivery personnel found." />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
