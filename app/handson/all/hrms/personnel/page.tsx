"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, UserMinus, FileText } from "lucide-react";
import Link from "next/link";
import { getPromotions } from "@/app/actions/handson/all/hrms/promotions";
import { getSeparations } from "@/app/actions/handson/all/hrms/separations";
import { format } from "date-fns";
import { verifyHrRole } from "@/app/lib/roles";

export default function PersonnelPage() {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [separations, setSeparations] = useState<any[]>([]);
    const [canEdit, setCanEdit] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const p = await getPromotions();
        const s = await getSeparations();
        const role = await verifyHrRole();
        setPromotions(p);
        setSeparations(s);
        setCanEdit(role);
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Personnel Management</h1>
                <p className="text-muted-foreground">Manage employee lifecycle: Promotions, Resignations, and Transfers.</p>
            </div>

            <Tabs defaultValue="promotions" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="promotions">Promotions</TabsTrigger>
                    <TabsTrigger value="separations">Resignations & Exits</TabsTrigger>
                </TabsList>

                <TabsContent value="promotions" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <h2 className="text-xl font-semibold">Employee Promotions</h2>
                        </div>
                        {canEdit && (
                            <Link href="/handson/all/hr/personnel/promotion/new">
                                <Button><Plus className="mr-2 h-4 w-4" /> Promote Employee</Button>
                            </Link>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {promotions.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-muted-foreground border rounded-lg bg-slate-50">
                                No promotions recorded yet.
                            </div>
                        ) : (
                            promotions.map((p) => (
                                <Card key={p.name}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">{p.employee}</CardTitle>
                                        <CardDescription>{format(new Date(p.promotion_date), "MMM dd, yyyy")}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Promoted To</div>
                                        <div className="font-semibold text-primary">{p.new_designation}</div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="separations" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <UserMinus className="h-5 w-5 text-red-600" />
                            <h2 className="text-xl font-semibold">Resignations & Terminations</h2>
                        </div>
                        {canEdit && (
                            <Link href="/handson/all/hr/personnel/separation/new">
                                <Button variant="destructive"><Plus className="mr-2 h-4 w-4" /> Record Exit</Button>
                            </Link>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {separations.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-muted-foreground border rounded-lg bg-slate-50">
                                No resignations recorded yet.
                            </div>
                        ) : (
                            separations.map((s) => (
                                <Card key={s.name}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">{s.employee}</CardTitle>
                                        <CardDescription>Resigned: {format(new Date(s.resignation_letter_date), "MMM dd, yyyy")}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600">{s.status}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
