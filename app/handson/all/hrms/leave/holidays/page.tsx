"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { getHolidays } from "@/app/actions/handson/all/hrms/leave";

export default function HolidayListPage() {
    const [holidays, setHolidays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const data = await getHolidays();
        setHolidays(data || []);
        setLoading(false);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center">
                    <Calendar className="mr-3 h-8 w-8" />
                    Holiday List
                </h1>
                <p className="text-muted-foreground">Company holidays for the current year.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Holidays</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Day</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Type</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4">Loading...</TableCell>
                                </TableRow>
                            ) : holidays.length > 0 ? (
                                holidays.map((h) => (
                                    <TableRow key={h.name}>
                                        <TableCell className="font-medium">
                                            {format(new Date(h.holiday_date), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(h.holiday_date), "EEEE")}
                                        </TableCell>
                                        <TableCell>{h.description}</TableCell>
                                        <TableCell>
                                            {h.weekly_off ? (
                                                <Badge variant="secondary">Weekly Off</Badge>
                                            ) : (
                                                <Badge>Holiday</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No holidays found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
