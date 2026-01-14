"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Printer } from "lucide-react";
import { getSalarySlip } from "@/app/actions/handson/all/hrms/payroll";
import { Skeleton } from "@/components/ui/skeleton";

export default function SalarySlipPage() {
    const params = useParams();
    const router = useRouter();
    const [slip, setSlip] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            loadSlip(params.id as string);
        }
    }, [params.id]);

    async function loadSlip(name: string) {
        const data = await getSalarySlip(name);
        setSlip(data);
        setLoading(false);
    }

    if (loading) return <div className="p-8"><Skeleton className="h-[600px] w-full max-w-3xl mx-auto" /></div>;
    if (!slip) return <div className="p-8 text-center">Salary Slip not found</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6 mb-10">
            <div className="flex justify-between items-center print:hidden">
                <Button variant="outline" onClick={() => router.back()}>Back to List</Button>
                <Button onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" /> Print Slip
                </Button>
            </div>

            <Card className="print:shadow-none print:border-none">
                <CardHeader className="text-center border-b pb-6">
                    <CardTitle className="text-2xl uppercase tracking-widest">{slip.company}</CardTitle>
                    <CardDescription>Salary Slip for {format(new Date(slip.start_date), "MMMM yyyy")}</CardDescription>
                    <div className="text-sm text-muted-foreground mt-2">
                        {format(new Date(slip.start_date), "MMM d")} - {format(new Date(slip.end_date), "MMM d, yyyy")}
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-8">
                    {/* Employee Info Header */}
                    <div className="grid grid-cols-2 gap-8 text-sm">
                        <div className="space-y-1">
                            <div className="text-muted-foreground">Employee Name</div>
                            <div className="font-semibold text-lg">{slip.employee_name}</div>
                            <div className="text-muted-foreground">{slip.designation}</div>
                            <div className="text-muted-foreground">{slip.department}</div>
                        </div>
                        <div className="space-y-1 text-right">
                            <div className="text-muted-foreground">Slip ID</div>
                            <div className="font-mono">{slip.name}</div>
                            <div className="text-muted-foreground mt-2">Bank Account</div>
                            <div className="font-mono">{slip.bank_account_no || "-"}</div>
                        </div>
                    </div>

                    <Separator />

                    {/* Earnings & Deductions Grid */}
                    <div className="grid grid-cols-2 gap-8">
                        {/* Earnings Column */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Earnings</h3>
                            <div className="space-y-2">
                                {slip.earnings?.map((earning: any, i: number) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span>{earning.salary_component}</span>
                                        <span className="font-mono">
                                            {earning.amount.toLocaleString('en-US', { style: 'currency', currency: slip.currency })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold">
                                <span>Gross Pay</span>
                                <span>{slip.gross_pay?.toLocaleString('en-US', { style: 'currency', currency: slip.currency })}</span>
                            </div>
                        </div>

                        {/* Deductions Column */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Deductions</h3>
                            <div className="space-y-2">
                                {slip.deductions?.map((deduction: any, i: number) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span>{deduction.salary_component}</span>
                                        <span className="font-mono text-red-600">
                                            {deduction.amount.toLocaleString('en-US', { style: 'currency', currency: slip.currency })}
                                        </span>
                                    </div>
                                ))}
                                {(!slip.deductions || slip.deductions.length === 0) && (
                                    <div className="text-sm text-muted-foreground italic">No deductions</div>
                                )}
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold text-red-600">
                                <span>Total Deduction</span>
                                <span>{slip.total_deduction?.toLocaleString('en-US', { style: 'currency', currency: slip.currency })}</span>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Net Pay Footer */}
                    <div className="bg-muted/30 p-6 rounded-lg flex justify-between items-center">
                        <div className="space-y-1">
                            <div className="text-sm font-medium uppercase text-muted-foreground">Net Payable</div>
                            <div className="text-xs text-muted-foreground italic">
                                {slip.total_in_words}
                            </div>
                        </div>
                        <div className="text-3xl font-bold font-mono text-green-700">
                            {slip.net_pay?.toLocaleString('en-US', { style: 'currency', currency: slip.currency })}
                        </div>
                    </div>

                    {/* Footer Notes */}
                    <div className="text-center text-xs text-muted-foreground pt-8">
                        generated by Rokct HRMS
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
