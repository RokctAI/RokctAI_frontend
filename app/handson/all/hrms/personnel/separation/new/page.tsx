"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import { createSeparation, SeparationData } from "@/app/actions/handson/all/hrms/separations";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";

export default function NewSeparationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [employees, setEmployees] = useState<any[]>([]);

    const [employee, setEmployee] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [reason, setReason] = useState("");

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

        const payload: SeparationData = {
            employee,
            resignation_letter_date: date,
            reason_for_leaving: reason,
            status: "Pending"
        };

        const res = await createSeparation(payload);

        setLoading(false);
        if (res.success) {
            toast.success("Resignation Recorded");
            router.push("/handson/all/hr/personnel");
        } else {
            toast.error(res.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto p-6">
            <div className="flex justify-between items-center">
                <Link href="/handson/all/hr/personnel"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                <h1 className="text-2xl font-bold">Record Resignation</h1>
                <Button type="submit" disabled={loading} variant="destructive"><Save className="mr-2 h-4 w-4" /> Submit</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Separation Details</CardTitle></CardHeader>
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
                        <Label>Resignation Date</Label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>

                    <div>
                        <Label>Reason for Leaving</Label>
                        <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain the reason..." rows={4} />
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
