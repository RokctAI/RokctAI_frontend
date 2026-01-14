"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { createJobApplicant, getJobOpenings } from "@/app/actions/handson/all/hrms/recruitment";

const formSchema = z.object({
    applicant_name: z.string().min(1, "Name is required"),
    email_id: z.string().email("Invalid email address"),
    job_title: z.string().min(1, "Job selection is required"),
    status: z.enum(["Open", "Replied", "Rejected", "Hold", "Accepted"]).default("Open"),
    cover_letter: z.string().optional(),
});

export default function NewCandidatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState<any[]>([]);

    useEffect(() => {
        getJobOpenings().then(setJobs);
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: "Open",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const result = await createJobApplicant(values);
            if (result.success) {
                toast.success("Candidate added successfully");
                router.push("/handson/all/hr/recruitment");
            } else {
                toast.error(result.error || "Failed to add candidate");
            }
        } catch (e) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Add New Candidate</h1>
                    <p className="text-muted-foreground">Manually add a candidate application.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
                    <FormField
                        control={form.control}
                        name="applicant_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Candidate Name <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Alice Smith" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. alice@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="job_title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Applying For <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Job Opening" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {jobs.map(job => (
                                                <SelectItem key={job.name} value={job.name}>
                                                    {job.job_title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Open">Open</SelectItem>
                                            <SelectItem value="Replied">Replied</SelectItem>
                                            <SelectItem value="Hold">Hold</SelectItem>
                                            <SelectItem value="Accepted">Accepted</SelectItem>
                                            <SelectItem value="Rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="cover_letter"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cover Letter / Notes</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Paste cover letter or internal notes here..."
                                        className="min-h-[150px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Candidate
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
