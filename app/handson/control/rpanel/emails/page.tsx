"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Mail, Search, KeyRound, Eye, EyeOff, X, Plus, Trash2 } from "lucide-react";
import { getEmails, updateEmailPassword, createEmailAccount, deleteEmailAccount } from "@/app/actions/handson/control/rpanel/emails/manage-email";
// import { RPanelNav } from "@/components/custom/nav/rpanel-nav";
import { getClientWebsites } from "@/app/actions/handson/control/rpanel/websites/get-client-websites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "next/navigation";

// Separate component for content that uses search params
function EmailsContent() {
    const searchParams = useSearchParams();
    const domainFilter = searchParams.get('domain') || "";

    const [emails, setEmails] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(domainFilter);

    // Password Change State
    const [editingEmail, setEditingEmail] = useState<any>(null);
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Create State
    const [showCreate, setShowCreate] = useState(false);
    const [newEmailUser, setNewEmailUser] = useState("");
    const [newEmailPassword, setNewEmailPassword] = useState("");
    const [selectedSite, setSelectedSite] = useState("");
    const [sites, setSites] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [emailRes, siteRes] = await Promise.all([
                getEmails(),
                getClientWebsites()
            ]);

            if (emailRes.message?.success) {
                setEmails(emailRes.message.emails);
            }
            if (siteRes.message?.success) {
                setSites(siteRes.message.websites);
                if (siteRes.message.websites.length > 0) {
                    // If domain filter is set, try to match it, otherwise select first
                    if (domainFilter) {
                        const matchingSite = siteRes.message.websites.find((s: any) => s.domain === domainFilter);
                        if (matchingSite) {
                            setSelectedSite(matchingSite.name);
                        } else {
                            setSelectedSite(siteRes.message.websites[0].name);
                        }
                    } else {
                        setSelectedSite(siteRes.message.websites[0].name);
                    }
                }
            }
            setLoading(false);
        }
        fetchData();
    }, []); // Run only on mount. searchQuery is initialized with domainFilter.

    const fetchEmails = async () => {
        const res = await getEmails();
        if (res.message?.success) setEmails(res.message.emails);
    };

    const filteredEmails = emails.filter(em =>
        em.email_user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        em.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePasswordUpdate = async () => {
        if (!editingEmail) return;
        setIsSaving(true);
        const res = await updateEmailPassword(editingEmail.website_name, editingEmail.email_user, newPassword);
        if (res.success) {
            setEditingEmail(null);
            setNewPassword("");
            alert("Password updated successfully.");
        } else {
            alert("Failed to update password: " + res.error);
        }
        setIsSaving(false);
    };

    const handleCreate = async () => {
        if (!newEmailUser || !newEmailPassword || !selectedSite) return;
        setIsSaving(true);
        const res = await createEmailAccount(selectedSite, newEmailUser, newEmailPassword);
        if (res.success) {
            setShowCreate(false);
            setNewEmailUser("");
            setNewEmailPassword("");
            fetchEmails();
            alert("Email account created successfully.");
        } else {
            alert("Failed to create: " + res.error);
        }
        setIsSaving(false);
    };

    const handleDelete = async (email: any) => {
        if (confirm(`Are you sure you want to delete ${email.email_user}@${email.domain}?`)) {
            const res = await deleteEmailAccount(email.website_name, email.email_user);
            if (res.success) {
                fetchEmails();
            } else {
                alert("Failed to delete: " + res.error);
            }
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Mail className="h-6 w-6 text-purple-500" /> Email Accounts
                </h1>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="relative w-1/3">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search emails..."
                        className="pl-9 bg-[#1a1f36] border-gray-700 text-gray-200"
                        value={searchQuery}
                        onChange={(e: any) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Button onClick={() => setShowCreate(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Email
                </Button>
            </div>

            <div className="rounded-lg border border-gray-700 bg-[#1a1f36] overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading emails...</div>
                ) : filteredEmails.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No email accounts found.</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="text-gray-400 font-medium border-b border-gray-700 bg-[#1a1f36]">
                            <tr>
                                <th className="px-6 py-4 font-normal">Email Address</th>
                                <th className="px-6 py-4 font-normal">Quota</th>
                                <th className="px-6 py-4 font-normal">Website</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredEmails.map((em, idx) => (
                                <tr key={idx} className="hover:bg-[#252b42] transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{em.email_user}@{em.domain}</td>
                                    <td className="px-6 py-4 text-gray-300">{em.quota_mb ? `${em.quota_mb} MB` : 'Unlimited'}</td>
                                    <td className="px-6 py-4 text-blue-400">{em.domain}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => setEditingEmail(em)} title="Change Password">
                                                <KeyRound className="h-4 w-4" />
                                            </Button>
                                            <Button variant="destructive" size="icon" onClick={() => handleDelete(em)} title="Delete">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Dialog open={!!editingEmail} onOpenChange={(open) => !open && setEditingEmail(null)}>
                <DialogContent className="bg-[#1a1f36] border-gray-700 text-gray-200">
                    <DialogHeader>
                        <DialogTitle>Change Password: {editingEmail?.email_user}@{editingEmail?.domain}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <label className="text-sm font-medium text-gray-400">New Password</label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e: any) => setNewPassword(e.target.value)}
                            />
                            <button
                                className="absolute right-3 top-2 text-gray-400 hover:text-white"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingEmail(null)}>Cancel</Button>
                        <Button onClick={handlePasswordUpdate} disabled={isSaving}>Update Password</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="bg-[#1a1f36] border-gray-700 text-gray-200">
                    <DialogHeader>
                        <DialogTitle>Create Email Account</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Website</label>
                            <Select value={selectedSite} onValueChange={setSelectedSite}>
                                <SelectTrigger className="bg-[#0f1219] border-gray-600 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1f36] border-gray-600 text-white">
                                    {sites.map(s => (
                                        <SelectItem key={s.name} value={s.name}>{s.domain}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Email User (before @)</label>
                            <Input
                                placeholder="info"
                                value={newEmailUser}
                                onChange={(e: any) => setNewEmailUser(e.target.value)}
                                className="bg-[#0f1219] border-gray-600 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Password</label>
                            <Input
                                type="password"
                                value={newEmailPassword}
                                onChange={(e: any) => setNewEmailPassword(e.target.value)}
                                className="bg-[#0f1219] border-gray-600 text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={isSaving}>Create Account</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function EmailsPage() {
    return (
        <div className="flex min-h-screen bg-[#0f1219] text-gray-200 font-sans">
            {/* <RPanelNav /> */}
            <main className="flex-1 p-8">
                <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading...</div>}>
                    <EmailsContent />
                </Suspense>
            </main>
        </div>
    );
}
