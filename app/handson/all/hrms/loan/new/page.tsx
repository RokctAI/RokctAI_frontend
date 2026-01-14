"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import { createLoan, LoanData } from "@/app/actions/handson/all/hrms/loans";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";

export default function NewLoanPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [employees, setEmployees] = useState<any[]>([]);

    const [employee, setEmployee] = useState("");
    const [loanType, setLoanType] = useState<"Salary Advance" | "Term Loan">("Salary Advance");
    const [amount, setAmount] = useState("1000");
    const [interest, setInterest] = useState("0");
    const [repayDate, setRepayDate] = useState(new Date().toISOString().split('T')[0]);
    const [repayMethod, setRepayMethod] = useState<"Repay Over Number of Periods" | "Repay Fixed Amount per Period">("Repay Over Number of Periods");
    const [repayPeriods, setRepayPeriods] = useState("12");

    useEffect(() => {
        loadLookups();
    }, []);

    async function loadLookups() {
        const emp = await getEmployees();
        setEmployees(emp);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload: LoanData = {
            employee,
            loan_type: loanType,
            loan_amount: parseFloat(amount),
            interest_rate: parseFloat(interest),
            repayment_start_date: repayDate,
            repayment_method: repayMethod,
            repayment_periods: repayMethod === "Repay Over Number of Periods" ? parseInt(repayPeriods) : undefined,
            monthly_repayment_amount: repayMethod === "Repay Fixed Amount per Period" ? parseInt(repayPeriods) : undefined,
            status: "Sanctioned"
        };

        const res = await createLoan(payload);

        setLoading(false);
        if (res.success) {
            toast.success("Loan Application Submitted");
            router.push("/handson/all/hr/loan");
        } else {
            toast.error(res.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto p-6">
            <div className="flex justify-between items-center">
                <Link href="/handson/all/hr/loan"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                <h1 className="text-2xl font-bold">New Loan Application</h1>
                <Button type="submit" disabled={loading}><Save className="mr-2 h-4 w-4" /> Apply</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Loan Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Employee</Label>
                        <Select value={employee} onValueChange={setEmployee}>
                            <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                            <SelectContent>
                                {employees.map(e => (
                                    <SelectItem key={e.name} value={e.name}>{e.employee_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Loan Type</Label>
                        <Select value={loanType} onValueChange={(v: any) => {
                            setLoanType(v);
                            if (v === "Salary Advance") setInterest("0");
                        }}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Salary Advance">Salary Advance (0% Interest)</SelectItem>
                                <SelectItem value="Term Loan">Term Loan (Interest Bearing)</SelectItem>
                            </SelectContent>
                        </Select>
                        {loanType === "Term Loan" && (
                            <p className="text-xs text-amber-600 mt-1">
                                ⚠ Check local regulations. Ensure Valid Credit Provider License.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Loan Amount</Label>
                            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="100" />
                        </div>
                        <div>
                            <Label>Interest Rate (%)</Label>
                            <Input
                                type="number"
                                value={interest}
                                onChange={e => setInterest(e.target.value)}
                                disabled={loanType === "Salary Advance"}
                                min="0"
                                step="0.1"
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Repayment Start Date</Label>
                        <Input type="date" value={repayDate} onChange={e => setRepayDate(e.target.value)} />
                    </div>

                    <div>
                        <Label>Repayment Method</Label>
                        <Select value={repayMethod} onValueChange={(val: any) => setRepayMethod(val)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Repay Over Number of Periods">Repay Over Number of Periods</SelectItem>
                                <SelectItem value="Repay Fixed Amount per Period">Repay Fixed Amount per Period</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>{repayMethod === "Repay Over Number of Periods" ? "Number of Months" : "Monthly Installment Amount"}</Label>
                        <Input type="number" value={repayPeriods} onChange={e => setRepayPeriods(e.target.value)} min="1" />
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
