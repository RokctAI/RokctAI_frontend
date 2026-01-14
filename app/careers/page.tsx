import { JobsService } from "@/app/services/control/jobs";
import { Header } from "@/components/custom/header";
import { Footer } from "@/components/custom/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function CareersPage() {
    let openings: any[] = [];
    try {
        openings = await JobsService.getOpenings();
    } catch (e) {
        console.error("Failed to fetch jobs:", e);
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-12 md:py-24">
                <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">Join Our Team</h1>
                    <p className="text-xl text-muted-foreground">
                        Build the future of AI-powered work with us. We're looking for passionate individuals to help us redefine productivity.
                    </p>
                </div>

                {openings.length > 0 ? (
                    <div className="grid gap-6 max-w-4xl mx-auto">
                        {openings.map((job) => (
                            <div
                                key={job.name}
                                className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border bg-card hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                            >
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                        {job.job_title}
                                    </h3>
                                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                        {job.department && (
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="w-4 h-4" />
                                                {job.department}
                                            </span>
                                        )}
                                        {job.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {job.location}
                                            </span>
                                        )}
                                    </div>
                                    {job.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-xl">
                                            {job.description.replace(/<[^>]*>?/gm, "")}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button asChild>
                                        <Link href={`/careers/${job.name}`}>
                                            Apply Now <ArrowRight className="ml-2 w-4 h-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
                        <h3 className="text-xl font-semibold text-muted-foreground">No current openings</h3>
                        <p className="text-sm text-muted-foreground mt-2">Check back later or follow us on social media.</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
