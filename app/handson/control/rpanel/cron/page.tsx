'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2, Play } from "lucide-react";
import { getCronJobs, createCronJob, deleteCronJob, updateCronJob } from "@/app/actions/handson/control/rpanel/cron/manage-cron";
import { getClientWebsites } from "@/app/actions/handson/control/rpanel/websites/get-client-websites";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "next/navigation";

interface CronJob {
    name: string;
    website: string;
    command: string;
    schedule: string;
    status: string;
    description?: string;
}

function CronJobsContent() {
    const searchParams = useSearchParams();
    const websiteFilter = searchParams.get('website') || "";

    const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
    const [websites, setWebsites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<CronJob | null>(null);
    const { toast } = useToast();

    // Form State
    const [selectedWebsite, setSelectedWebsite] = useState<string>('');
    const [command, setCommand] = useState('');
    const [schedule, setSchedule] = useState('* * * * *');
    const [description, setDescription] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (editingJob) {
            setSelectedWebsite(editingJob.website);
            setCommand(editingJob.command);
            setSchedule(editingJob.schedule);
            setDescription(editingJob.description || '');
        } else {
            // Reset form for new entry
            if (websites.length > 0 && !selectedWebsite) {
                // Respect filter if available
                if (websiteFilter) {
                    const matchingSite = websites.find((s: any) => s.name === websiteFilter || s.domain === websiteFilter);
                    if (matchingSite) {
                        setSelectedWebsite(matchingSite.name);
                    } else {
                        setSelectedWebsite(websites[0].name);
                    }
                } else {
                    setSelectedWebsite(websites[0].name);
                }
            }
            setCommand('');
            setSchedule('* * * * *');
            setDescription('');
        }
    }, [editingJob, dialogOpen]);

    async function loadData() {
        try {
            const [cronRes, websitesRes] = await Promise.all([
                getCronJobs(),
                getClientWebsites()
            ]);

            if (cronRes?.success) {
                setCronJobs(cronRes.cron_jobs || []);
            }
            if (websitesRes?.success) {
                setWebsites(websitesRes.websites || []);
                if (websitesRes.websites?.length > 0 && !selectedWebsite) {
                    if (websiteFilter) {
                        const matchingSite = websitesRes.websites.find((s: any) => s.name === websiteFilter || s.domain === websiteFilter);
                        if (matchingSite) {
                            setSelectedWebsite(matchingSite.name);
                        } else {
                            setSelectedWebsite(websitesRes.websites[0].name);
                        }
                    } else {
                        setSelectedWebsite(websitesRes.websites[0].name);
                    }
                }
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load data",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Filter Cron Jobs
    const filteredCronJobs = websiteFilter
        ? cronJobs.filter(j => j.website === websiteFilter || websites.find(w => w.name === websiteFilter)?.domain === j.website)
        : cronJobs;

    async function handleSave() {
        if (!selectedWebsite || !command || !schedule) {
            toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            const data = {
                website: selectedWebsite,
                command,
                schedule,
                description
            };

            let result;
            if (editingJob) {
                result = await updateCronJob(editingJob.name, data);
            } else {
                result = await createCronJob(data);
            }

            if (result?.success) {
                toast({ title: "Success", description: `Cron job ${editingJob ? 'updated' : 'created'} successfully` });
                setDialogOpen(false);
                setEditingJob(null);
                loadData();
            } else {
                toast({ title: "Error", description: result?.error || "Failed to save cron job", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(name: string) {
        if (!confirm('Are you sure you want to delete this cron job?')) return;

        try {
            const result = await deleteCronJob(name);
            if (result?.success) {
                toast({ title: "Success", description: "Cron job deleted" });
                setCronJobs(cronJobs.filter(j => j.name !== name));
            } else {
                toast({ title: "Error", description: result?.error || "Failed to delete cron job", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete cron job", variant: "destructive" });
        }
    }

    if (isLoading) return <div className="p-8 text-center">Loading cron jobs...</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cron Jobs</h1>
                    <p className="text-muted-foreground">Schedule automated tasks for your websites.</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) setEditingJob(null);
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingJob(null)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Cron Job
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingJob ? 'Edit Cron Job' : 'Add New Cron Job'}</DialogTitle>
                            <DialogDescription>
                                Configure a scheduled task to run on your server.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Website</Label>
                                <Select value={selectedWebsite} onValueChange={setSelectedWebsite} disabled={!!editingJob}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select website" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {websites.map(site => (
                                            <SelectItem key={site.name} value={site.name}>
                                                {site.domain}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Command</Label>
                                <Input value={command} onChange={(e) => setCommand(e.target.value)} placeholder="/usr/bin/php /home/user/script.php" />
                            </div>
                            <div className="space-y-2">
                                <Label>Schedule (Cron Format)</Label>
                                <Input value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="* * * * *" />
                                <p className="text-xs text-muted-foreground">Minute Hour Day Month Weekday</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Description (Optional)</Label>
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Daily cleanup script" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Cron Job'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Scheduled Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Website</TableHead>
                                <TableHead>Command</TableHead>
                                <TableHead>Schedule</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCronJobs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No cron jobs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCronJobs.map((job) => (
                                    <TableRow key={job.name}>
                                        <TableCell className="font-medium">{job.website}</TableCell>
                                        <TableCell className="font-mono text-sm truncate max-w-[200px]" title={job.command}>{job.command}</TableCell>
                                        <TableCell className="font-mono text-sm">{job.schedule}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {job.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                setEditingJob(job);
                                                setDialogOpen(true);
                                            }} title="Edit">
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(job.name)} title="Delete">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default function CronJobsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <CronJobsContent />
        </Suspense>
    );
}
