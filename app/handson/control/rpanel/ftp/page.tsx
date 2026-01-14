"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Folder, Search, KeyRound, Eye, EyeOff, X, Plus, Trash2 } from "lucide-react";
import { getFtpAccounts, updateFtpPassword, createFtpAccount, deleteFtpAccount } from "@/app/actions/handson/control/rpanel/ftp/manage-ftp";
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

function FtpContent() {
    const searchParams = useSearchParams();
    const websiteFilter = searchParams.get('website') || "";

    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(websiteFilter); // Initialize with filter

    // Password Change State
    const [editingFtp, setEditingFtp] = useState<any>(null);
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Create State
    const [showCreate, setShowCreate] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newFtpPassword, setNewFtpPassword] = useState("");
    const [selectedSite, setSelectedSite] = useState("");
    const [sites, setSites] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [ftpRes, siteRes] = await Promise.all([
                getFtpAccounts(),
                getClientWebsites()
            ]);

            if (ftpRes.message?.success) {
                setAccounts(ftpRes.message.ftp_accounts);
            }
            if (siteRes.message?.success) {
                setSites(siteRes.message.websites);
                if (siteRes.message.websites.length > 0) {
                    // If domain filter is set, try to match it, otherwise select first
                    if (websiteFilter) {
                        const matchingSite = siteRes.message.websites.find((s: any) => s.name === websiteFilter || s.domain === websiteFilter);
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
    }, []); // Run once on mount

    const fetchFtp = async () => {
        const res = await getFtpAccounts();
        if (res.message?.success) setAccounts(res.message.ftp_accounts);
    };

    const filteredAccounts = accounts.filter(ftp =>
        ftp.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ftp.website.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePasswordUpdate = async () => {
        if (!editingFtp) return;
        setIsSaving(true);
        const res = await updateFtpPassword(editingFtp.name, newPassword);
        if (res.success) {
            setEditingFtp(null);
            setNewPassword("");
            alert("Password updated successfully.");
        } else {
            alert("Failed to update password: " + res.error);
        }
        setIsSaving(false);
    };

    const handleCreate = async () => {
        if (!newUsername || !newFtpPassword || !selectedSite) return;
        setIsSaving(true);
        const res = await createFtpAccount(selectedSite, newUsername, newFtpPassword);
        if (res.success) {
            setShowCreate(false);
            setNewUsername("");
            setNewFtpPassword("");
            fetchFtp();
            alert("FTP account created successfully.");
        } else {
            alert("Failed to create: " + res.error);
        }
        setIsSaving(false);
    };

    const handleDelete = async (ftp: any) => {
        if (confirm(`Are you sure you want to delete FTP user ${ftp.username}?`)) {
            const res = await deleteFtpAccount(ftp.name);
            if (res.success) {
                fetchFtp();
            } else {
                alert("Failed to delete: " + res.error);
            }
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Folder className="h-6 w-6 text-yellow-500" /> FTP Accounts
                </h1>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="relative w-1/3">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search FTP accounts..."
                        className="pl-9 bg-[#1a1f36] border-gray-700 text-gray-200"
                        value={searchQuery}
                        onChange={(e: any) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Button onClick={() => setShowCreate(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create FTP Account
                </Button>
            </div>

            <div className="rounded-lg border border-gray-700 bg-[#1a1f36] overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading FTP accounts...</div>
                ) : filteredAccounts.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No FTP accounts found.</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="text-gray-400 font-medium border-b border-gray-700 bg-[#1a1f36]">
                            <tr>
                                <th className="px-6 py-4 font-normal">Username</th>
                                <th className="px-6 py-4 font-normal">Quota</th>
                                <th className="px-6 py-4 font-normal">Website</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredAccounts.map((ftp, idx) => (
                                <tr key={idx} className="hover:bg-[#252b42] transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{ftp.username}</td>
                                    <td className="px-6 py-4 text-gray-300">{ftp.quota_mb ? `${ftp.quota_mb} MB` : 'Unlimited'}</td>
                                    <td className="px-6 py-4 text-blue-400">{ftp.website}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => setEditingFtp(ftp)} title="Change Password">
                                                <KeyRound className="h-4 w-4" />
                                            </Button>
                                            <Button variant="destructive" size="icon" onClick={() => handleDelete(ftp)} title="Delete">
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

            <Dialog open={!!editingFtp} onOpenChange={(open) => !open && setEditingFtp(null)}>
                <DialogContent className="bg-[#1a1f36] border-gray-700 text-gray-200">
                    <DialogHeader>
                        <DialogTitle>Change Password: {editingFtp?.username}</DialogTitle>
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
                        <Button variant="ghost" onClick={() => setEditingFtp(null)}>Cancel</Button>
                        <Button onClick={handlePasswordUpdate} disabled={isSaving}>Update Password</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="bg-[#1a1f36] border-gray-700 text-gray-200">
                    <DialogHeader>
                        <DialogTitle>Create FTP Account</DialogTitle>
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
                            <label className="text-sm font-medium text-gray-400">Username</label>
                            <Input
                                placeholder="ftp_user"
                                value={newUsername}
                                onChange={(e: any) => setNewUsername(e.target.value)}
                                className="bg-[#0f1219] border-gray-600 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Password</label>
                            <Input
                                type="password"
                                value={newFtpPassword}
                                onChange={(e: any) => setNewFtpPassword(e.target.value)}
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

export default function FtpPage() {
    return (
        <div className="flex min-h-screen bg-[#0f1219] text-gray-200 font-sans">
            {/* <RPanelNav /> */}
            <main className="flex-1 p-8">
                <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading...</div>}>
                    <FtpContent />
                </Suspense>
            </main>
        </div>
    );
}
