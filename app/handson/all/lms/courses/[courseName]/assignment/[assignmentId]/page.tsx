"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchAssignment, fetchMySubmission, submitAssignmentAction } from "@/app/actions/handson/all/lms/assignments/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, FileText, Link as LinkIcon } from "lucide-react";

export default function AssignmentPage() {
    const params = useParams();
    const router = useRouter();
    const assignmentName = decodeURIComponent(params.assignmentId as string);

    const [assignment, setAssignment] = useState<any>(null);
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [answer, setAnswer] = useState("");
    const [attachment, setAttachment] = useState("");

    useEffect(() => {
        loadData();
    }, [assignmentName]);

    async function loadData() {
        setLoading(true);
        try {
            const [assData, subData] = await Promise.all([
                fetchAssignment(assignmentName),
                fetchMySubmission(assignmentName)
            ]);

            setAssignment(assData);
            if (subData) {
                setSubmission(subData);
                setAnswer(subData.answer || "");
                setAttachment(subData.assignment_attachment || "");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load assignment");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit() {
        if (!answer && !attachment) {
            toast.warning("Please provide an answer or attachment");
            return;
        }

        setSubmitting(true);
        try {
            await submitAssignmentAction(assignmentName, {
                answer,
                attachment,
                submissionName: submission?.name
            });
            toast.success("Assignment submitted successfully");
            loadData(); // Reload to get updated status
        } catch (err: any) {
            toast.error(err.message || "Failed to submit assignment");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className="p-10"><Skeleton className="h-96 w-full" /></div>;
    if (!assignment) return <div className="p-10 text-center">Assignment not found</div>;

    const isGraded = submission?.status === "Pass" || submission?.status === "Fail";

    return (
        <div className="container max-w-4xl py-10 space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">{assignment.title}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{assignment.type}</Badge>
                        {submission && (
                            <Badge variant={submission.status === 'Pass' ? 'default' : submission.status === 'Fail' ? 'destructive' : 'secondary'}>
                                {submission.status || 'Submitted'}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left: Content */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: assignment.question }}
                        />
                    </CardContent>
                </Card>

                {/* Right: Submission */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Submission</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isGraded ? (
                                <div className="rounded-md bg-muted p-4 space-y-2">
                                    <div className="font-semibold flex items-center gap-2">
                                        Status: {submission.status}
                                        {submission.status === 'Pass' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                        {submission.status === 'Fail' && <AlertCircle className="h-4 w-4 text-red-500" />}
                                    </div>
                                    {submission.grade && <div className="text-sm">Grade: {submission.grade}</div>}
                                    {submission.comments && (
                                        <div className="text-sm text-muted-foreground pt-2 border-t mt-2">
                                            <p className="font-medium text-foreground">Feedback:</p>
                                            <div dangerouslySetInnerHTML={{ __html: submission.comments }} />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {assignment.type === 'Text' && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Your Answer</label>
                                            <Textarea
                                                placeholder="Type your answer here..."
                                                className="min-h-[150px]"
                                                value={answer}
                                                onChange={(e) => setAnswer(e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {assignment.type === 'URL' && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Submission URL</label>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    className="pl-9"
                                                    placeholder="https://..."
                                                    value={answer}
                                                    onChange={(e) => setAnswer(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {(assignment.type === 'File' || assignment.type === 'Image' || assignment.type === 'PDF' || assignment.type === 'Document') && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">File URL</label>
                                            <div className="text-xs text-muted-foreground mb-2">
                                                Uploads not yet supported directly. Please provide a link to your file.
                                            </div>
                                            <div className="relative">
                                                <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    className="pl-9"
                                                    placeholder="https://.../file.pdf"
                                                    value={attachment}
                                                    onChange={(e) => setAttachment(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                        <CardFooter>
                            {!isGraded && (
                                <Button
                                    className="w-full"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? "Submitting..." : (submission ? "Update Submission" : "Submit Assignment")}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
