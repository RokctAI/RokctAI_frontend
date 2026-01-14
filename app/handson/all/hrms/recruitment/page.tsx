"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobOpeningList } from "@/components/handson/job-opening-list";
import { JobApplicantList } from "@/components/handson/job-applicant-list";

export default function RecruitmentPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Recruitment</h1>
                <p className="text-muted-foreground">Manage job openings and track candidates.</p>
            </div>

            <Tabs defaultValue="jobs" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="jobs">Job Openings</TabsTrigger>
                    <TabsTrigger value="candidates">Candidates</TabsTrigger>
                </TabsList>

                <TabsContent value="jobs" className="space-y-4">
                    <JobOpeningList />
                </TabsContent>

                <TabsContent value="candidates" className="space-y-4">
                    <JobApplicantList />
                </TabsContent>
            </Tabs>
        </div>
    );
}
