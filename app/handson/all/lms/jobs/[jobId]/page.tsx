"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchJob } from "@/app/actions/handson/all/lms/jobs/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Briefcase, MapPin, Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function JobDetailPage() {
    const params = useParams();
    const jobName = decodeURIComponent(params.jobId as string);

    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadJob();
    }, [jobName]);

    async function loadJob() {
        setLoading(true);
        try {
            const data = await fetchJob(jobName);
            if (data) setJob(data);
        } catch (err) {
            toast.error("Failed to load job details");
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="p-10"><Skeleton className="h-96 w-full" /></div>;
    if (!job) return <div className="p-10 text-center">Job not found</div>;

    return (
        <div className="container max-w-4xl py-10 space-y-8">
            <Button variant="ghost" asChild className="mb-4">
                <Link href="../jobs"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs</Link>
            </Button>

            <header className="space-y-4 border-b pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-4xl font-bold">{job.job_title}</h1>
                    <Button size="lg">Apply Now</Button>
                </div>
                <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <span className="flex items-center gap-2"><Building2 className="h-4 w-4" /> {job.company}</span>
                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {job.location}</span>
                    <Badge variant="outline">{job.type}</Badge>
                    <Badge variant={job.status === 'Open' ? 'default' : 'secondary'}>{job.status}</Badge>
                </div>
            </header>

            <div className="prose dark:prose-invert max-w-none">
                <h3>Description</h3>
                <div dangerouslySetInnerHTML={{ __html: job.description }} />
            </div>
        </div>
    );
}
