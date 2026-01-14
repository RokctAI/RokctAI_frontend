"use client";

import { useEffect, useState } from "react";
import { fetchJobs } from "@/app/actions/handson/all/lms/jobs/actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Future: Search
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Briefcase, MapPin, Building2 } from "lucide-react";
import Link from "next/link";

export default function JobsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadJobs();
    }, []);

    async function loadJobs() {
        setLoading(true);
        try {
            const data = await fetchJobs();
            if (data) setJobs(data);
        } catch (err) {
            toast.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div className="container max-w-5xl py-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
    );

    return (
        <div className="container max-w-5xl py-10 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Career Opportunities</h1>
                {/* <Button variant="outline">My Applications</Button> */}
            </div>

            {jobs.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-lg">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium">No Open Positions</h3>
                    <p className="text-muted-foreground">Check back later for new opportunities.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map((job) => (
                        <Card key={job.name} className="flex flex-col hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="secondary">{job.type || 'Full Time'}</Badge>
                                </div>
                                <CardTitle className="line-clamp-2 min-h-[3.5rem]">{job.job_title}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-2">
                                    <Building2 className="h-4 w-4" /> {job.company || 'Company Confidential'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                    <MapPin className="h-4 w-4" /> {job.location || 'Remote'}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {/* Strip HTML simplified */}
                                    {job.description?.replace(/<[^>]*>?/gm, "") || "No description available."}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" asChild>
                                    <Link href={`./jobs/${job.name}`}>View Details</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
