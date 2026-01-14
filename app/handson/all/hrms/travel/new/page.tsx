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
import { createTravelRequest, TravelRequestData } from "@/app/actions/handson/all/hrms/travel";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";

export default function NewTravelRequestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [employees, setEmployees] = useState<any[]>([]);

    const [employee, setEmployee] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [purpose, setPurpose] = useState("");
    const [destination, setDestination] = useState("");
    const [cost, setCost] = useState("0");

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

        const payload: TravelRequestData = {
            employee,
            start_date: startDate,
            end_date: endDate,
            purpose,
            destination,
            estimated_cost: parseFloat(cost),
            status: "Open"
        };

        const res = await createTravelRequest(payload);

        setLoading(false);
        if (res.success) {
            toast.success("Travel Request Submitted");
            router.push("/handson/all/hr/travel");
        } else {
            toast.error(res.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
            <div className="flex justify-between items-center">
                <Link href="/handson/all/hr/travel"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                <h1 className="text-2xl font-bold">New Travel Request</h1>
                <Button type="submit" disabled={loading}><Save className="mr-2 h-4 w-4" /> Submit Request</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Trip Details</CardTitle></CardHeader>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Start Date</Label>
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <Label>End Date</Label>
                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <Label>Destination</Label>
                        <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. London, UK" />
                    </div>

                    <div>
                        <Label>Purpose/Description</Label>
                        <Textarea value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Client meeting with..." rows={3} />
                    </div>

                    <div>
                        <Label>Estimated Cost ($)</Label>
                        <Input type="number" value={cost} onChange={e => setCost(e.target.value)} min="0" step="0.01" />
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
