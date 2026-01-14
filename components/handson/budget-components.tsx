"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { createBudget } from "@/app/actions/handson/all/accounting/budgets/createBudget";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function BudgetList({ items }: { items: any[] }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-2xl font-bold">Budgets</h1><p className="text-muted-foreground">Spending limits.</p></div>
                <Link href="/handson/all/financials/accounts/budget/new"><Button><Plus className="mr-2 h-4 w-4" /> New Budget</Button></Link>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Against</TableHead><TableHead>Target</TableHead><TableHead>Year</TableHead></TableRow></TableHeader>
                    <TableBody>{items.map(t => <TableRow key={t.name}><TableCell>{t.name}</TableCell><TableCell>{t.budget_against}</TableCell><TableCell>{t.cost_center || t.project}</TableCell><TableCell>{t.fiscal_year}</TableCell></TableRow>)}</TableBody>
                </Table>
            </div>
        </div>
    );
}

export function BudgetForm() {
    const router = useRouter();
    const [year, setYear] = useState("2025");
    const [center, setCenter] = useState("");
    const [account, setAccount] = useState("");
    const [amount, setAmount] = useState(0);

    const handleSubmit = async () => {
        const res = await createBudget({
            budget_against: "Cost Center",
            cost_center: center,
            company: "Juvo",
            fiscal_year: year,
            accounts: [{ account, budget_amount: amount }]
        });
        if (res.success) { toast.success("Budget Created"); router.push("/handson/all/financials/accounts/budget"); }
        else toast.error(res.error);
    };

    return (
        <div className="max-w-md mx-auto space-y-4">
            <h1 className="text-2xl font-bold">New Budget</h1>
            <Card>
                <CardContent className="space-y-4 pt-4">
                    <div><Label>Fiscal Year</Label><Input value={year} onChange={e => setYear(e.target.value)} /></div>
                    <div><Label>Cost Center</Label><Input value={center} onChange={e => setCenter(e.target.value)} placeholder="e.g. Main - JVO" /></div>

                    <div className="p-4 border rounded bg-muted/20">
                        <Label className="font-bold mb-2 block">Limit</Label>
                        <div><Label>Account</Label><Input value={account} onChange={e => setAccount(e.target.value)} placeholder="e.g. Expenses" className="mb-2" /></div>
                        <div><Label>Max Amount</Label><Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} /></div>
                    </div>

                    <Button onClick={handleSubmit} className="w-full">Set Budget</Button>
                </CardContent>
            </Card>
        </div>
    );
}
