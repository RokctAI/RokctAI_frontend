"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { createTimesheet } from "@/app/actions/handson/all/projects/timesheets";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function TimesheetList({ items }: { items: any[] }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-2xl font-bold">Timesheets</h1><p className="text-muted-foreground">Log time.</p></div>
                <Link href="/handson/all/work_management/projects/timesheet/new"><Button><Plus className="mr-2 h-4 w-4" /> Log Time</Button></Link>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Start Date</TableHead><TableHead>Total Hours</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>{items.map(t => <TableRow key={t.name}><TableCell>{t.name}</TableCell><TableCell>{t.start_date}</TableCell><TableCell>{t.total_hours}</TableCell><TableCell>{t.status}</TableCell></TableRow>)}</TableBody>
                </Table>
            </div>
        </div>
    );
}

export function TimesheetForm() {
    const router = useRouter();
    const [activity, setActivity] = useState("");
    const [hours, setHours] = useState(0);
    const [project, setProject] = useState("");

    const handleSubmit = async () => {
        // Submit timesheet entry
        const res = await createTimesheet({
            company: "Juvo",
            time_logs: [{ activity_type: activity, hours: hours, project }]
        });
        if (res.success) { toast.success("Timesheet Submitted"); router.push("/handson/all/work_management/projects/timesheet"); }
        else toast.error(res.error);
    };

    return (
        <div className="max-w-xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">New Timesheet</h1>
            <Card>
                <CardContent className="space-y-4 pt-4">
                    <div><Label>Activity Type</Label><Input value={activity} onChange={e => setActivity(e.target.value)} placeholder="e.g. Development" /></div>
                    <div><Label>Hours</Label><Input type="number" value={hours} onChange={e => setHours(Number(e.target.value))} /></div>
                    <div><Label>Project (Optional)</Label><Input value={project} onChange={e => setProject(e.target.value)} /></div>
                    <Button onClick={handleSubmit}>Submit</Button>
                </CardContent>
            </Card>
        </div>
    );
}
