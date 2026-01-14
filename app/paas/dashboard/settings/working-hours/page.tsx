"use client";

import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getWorkingHours, updateWorkingHours } from "@/app/actions/paas/working-hours";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";


interface WorkingDay {
    day_of_week: string;
    opening_time: string;
    closing_time: string;
    is_closed: number;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function WorkingHoursPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [workingDays, setWorkingDays] = useState<WorkingDay[]>([]);

    useEffect(() => {
        async function fetchHours() {
            try {
                const data = await getWorkingHours();
                // Initialize with all days if empty
                if (!data || data.length === 0) {
                    const initialDays = DAYS_OF_WEEK.map(day => ({
                        day_of_week: day,
                        opening_time: "09:00",
                        closing_time: "18:00",
                        is_closed: 0
                    }));
                    setWorkingDays(initialDays);
                } else {
                    // Ensure all days are present and sorted
                    const sortedDays = DAYS_OF_WEEK.map(day => {
                        const existing = data.find((d: any) => d.day_of_week === day);
                        return existing ? {
                            ...existing,
                            is_closed: Number(existing.is_closed)
                        } : {
                            day_of_week: day,
                            opening_time: "09:00",
                            closing_time: "18:00",
                            is_closed: 0
                        };
                    });
                    setWorkingDays(sortedDays);
                }
            } catch (error) {
                console.error("Error fetching working hours:", error);
                toast.error("Failed to load working hours");
            } finally {
                setLoading(false);
            }
        }
        fetchHours();
    }, []);

    const handleChange = (index: number, field: keyof WorkingDay, value: any) => {
        const newDays = [...workingDays];
        newDays[index] = { ...newDays[index], [field]: value };
        setWorkingDays(newDays);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateWorkingHours(workingDays);
            toast.success("Working hours updated successfully");
        } catch (error) {
            console.error("Error updating working hours:", error);
            toast.error("Failed to update working hours");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/paas/dashboard/settings">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="size-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Working Hours</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Schedule</CardTitle>
                        <CardDescription>Set your shop's opening and closing times.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {workingDays.map((day, index) => (
                            <div key={day.day_of_week} className="flex items-center gap-4 p-4 border rounded-lg">
                                <div className="w-32 font-medium">{day.day_of_week}</div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={day.is_closed === 0}
                                        onCheckedChange={(checked) => handleChange(index, "is_closed", checked ? 0 : 1)}
                                    />
                                    <span className="text-sm text-muted-foreground w-16">
                                        {day.is_closed ? "Closed" : "Open"}
                                    </span>
                                </div>
                                {!day.is_closed && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`open-${index}`} className="sr-only">Opening Time</Label>
                                            <Input
                                                id={`open-${index}`}
                                                type="time"
                                                value={day.opening_time}
                                                onChange={(e) => handleChange(index, "opening_time", e.target.value)}
                                                className="w-32"
                                            />
                                        </div>
                                        <span>to</span>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`close-${index}`} className="sr-only">Closing Time</Label>
                                            <Input
                                                id={`close-${index}`}
                                                type="time"
                                                value={day.closing_time}
                                                onChange={(e) => handleChange(index, "closing_time", e.target.value)}
                                                className="w-32"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={saving} size="lg">
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 size-4" />
                                Save Schedule
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
