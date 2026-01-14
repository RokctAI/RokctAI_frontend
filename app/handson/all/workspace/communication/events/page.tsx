"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Plus, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createEvent, getEvents, deleteEvent, EventData } from "@/app/actions/handson/all/workspace/events";

const eventSchema = z.object({
    subject: z.string().min(2, "Subject is required"),
    starts_on: z.date({ required_error: "Start date is required" }),
    description: z.string().optional(),
    event_type: z.enum(["Private", "Public"]).default("Private"),
    status: z.enum(["Open", "Closed", "Cancelled"]).default("Open"),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional(), // Simple text input for time
});

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(new Date());

    const form = useForm<z.infer<typeof eventSchema>>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            subject: "",
            event_type: "Private",
            status: "Open",
            time: "09:00"
        },
    });

    useEffect(() => {
        loadEvents();
    }, []);

    async function loadEvents() {
        setLoading(true);
        const data = await getEvents();
        setEvents(data);
        setLoading(false);
    }

    async function onSubmit(values: z.infer<typeof eventSchema>) {
        // combine date and time string
        let startDateTime = values.starts_on;
        if (values.time) {
            const [hours, minutes] = values.time.split(':');
            startDateTime.setHours(parseInt(hours), parseInt(minutes));
        }

        const payload: EventData = {
            subject: values.subject,
            starts_on: format(startDateTime, "yyyy-MM-dd HH:mm:ss"), // Standard Frappe format
            description: values.description,
            event_type: values.event_type as any,
            status: values.status as any,
            all_day: 0
        };

        const result = await createEvent(payload);
        if (result.success) {
            toast.success("Event created successfully");
            setOpen(false);
            form.reset();
            loadEvents();
        } else {
            toast.error(result.error || "Failed to create event");
        }
    }

    async function handleDelete(name: string) {
        if (!confirm("Delete this event?")) return;
        const result = await deleteEvent(name);
        if (result.success) {
            toast.success("Event deleted");
            loadEvents();
        } else {
            toast.error("Failed to delete");
        }
    }

    // Filter events for the selected date on calendar (simple client-side filter)
    const selectedDateEvents = events.filter(event => {
        if (!date) return true;
        const eventDate = new Date(event.starts_on);
        return eventDate.toDateString() === date.toDateString();
    });

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Internal Events</h1>
                    <p className="text-muted-foreground">Manage schedule, meetings, and deadlines.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Create Event</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Event</DialogTitle>
                            <DialogDescription>Schedule a meeting or reminder.</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subject</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Team Meeting" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="starts_on"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) => date < new Date("1900-01-01")}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="time"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Time</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input className="pl-8" placeholder="09:00" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="event_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Private">Private</SelectItem>
                                                    <SelectItem value="Public">Public</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Agenda..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Event
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Card>
                        <CardContent className="p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border shadow-sm w-full"
                            />
                        </CardContent>
                    </Card>
                    <div className="mt-4 p-4 border rounded bg-muted/20">
                        <h3 className="font-semibold mb-2">Upcoming Events</h3>
                        {/* Simple list of next 3 events irrespective of date selection */}
                        <div className="space-y-2 text-sm">
                            {events.slice(0, 3).map(e => (
                                <div key={e.name} className="flex justify-between">
                                    <span>{e.subject}</span>
                                    <span className="text-muted-foreground">{format(new Date(e.starts_on), "MMM d")}</span>
                                </div>
                            ))}
                            {events.length === 0 && <span className="text-muted-foreground italic">No upcoming events.</span>}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-primary" />
                        Schedule for {date ? format(date, "MMMM do, yyyy") : "All Events"}
                    </h2>

                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : selectedDateEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded bg-slate-50">
                            <CalendarIcon className="h-10 w-10 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground font-medium">No events for this date.</p>
                            <p className="text-xs text-muted-foreground">Click "Create Event" to add one.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {selectedDateEvents.map((event) => (
                                <Card key={event.name} className="hover:shadow transition-shadow">
                                    <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-base font-semibold">{event.subject}</CardTitle>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleDelete(event.name)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 text-sm space-y-1">
                                        <div className="flex gap-4 text-muted-foreground">
                                            <span className="flex items-center">
                                                <Clock className="mr-1 h-3 w-3" />
                                                {format(new Date(event.starts_on), "h:mm a")}
                                            </span>
                                            <span className="bg-slate-100 px-2 rounded text-xs border text-slate-600">
                                                {event.event_type}
                                            </span>
                                            <span className={cn(
                                                "px-2 rounded text-xs border",
                                                event.status === "Open" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100"
                                            )}>
                                                {event.status}
                                            </span>
                                        </div>
                                        {event.description && (
                                            <p className="pt-2 text-slate-600 line-clamp-2">{event.description}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
