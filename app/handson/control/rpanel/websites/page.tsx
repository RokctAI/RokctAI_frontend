"use client";

import React, { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Edit, MoreVertical, Search, ExternalLink, ShieldCheck, Database, LayoutGrid, List, Mail, FileText, Folder, Settings, RefreshCw, Image as ImageIcon } from "lucide-react";
import { getClientWebsites } from "@/app/actions/handson/control/rpanel/websites/get-client-websites";
import { getServerInfo } from "@/app/actions/handson/control/rpanel/dashboard/get-server-info";
import { deleteWebsite, updateWebsite, issueSSL } from "@/app/actions/handson/control/rpanel/websites/manage-website";
import { createWebsite } from "@/app/actions/handson/control/rpanel/websites/create-website";
// import { RPanelNav } from "@/components/custom/nav/rpanel-nav";
import { StatusBadge } from "@/components/custom/rpanel/status-badge";
import { ServerInfoHeader } from "@/components/custom/rpanel/server-info-header";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

export default function WebsitesPage() {
    const [websites, setWebsites] = useState<any[]>([]);
    const [filteredWebsites, setFilteredWebsites] = useState<any[]>([]);
    const [serverInfo, setServerInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingInfo, setIsLoadingInfo] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"list" | "grid">("grid"); // Default to grid based on screenshot

    // Edit State
    const [editingSite, setEditingSite] = useState<any>(null);
    const [editPhpVersion, setEditPhpVersion] = useState("");
    const [editPhpMode, setEditPhpMode] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Create State
    const [showCreate, setShowCreate] = useState(false);
    const [newDomain, setNewDomain] = useState("");
    const [newType, setNewType] = useState("WordPress");
    const [newPhp, setNewPhp] = useState("8.2");

    const fetchWebsites = async () => {
        setIsLoading(true);
        const res = await getClientWebsites();
        if (res.message?.success) {
            setWebsites(res.message.websites);
            setFilteredWebsites(res.message.websites);
        }
        setIsLoading(false);
    };

    const fetchServerInfo = async () => {
        setIsLoadingInfo(true);
        const res = await getServerInfo();
        if (res.message?.success) {
            setServerInfo(res.message);
        }
        setIsLoadingInfo(false);
    }

    useEffect(() => {
        fetchWebsites();
        fetchServerInfo();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredWebsites(websites);
        } else {
            const lower = searchQuery.toLowerCase();
            setFilteredWebsites(websites.filter(site =>
                site.domain.toLowerCase().includes(lower) ||
                (site.aliases && site.aliases.toLowerCase().includes(lower))
            ));
        }
    }, [searchQuery, websites]);

    const handleDelete = async (name: string) => {
        if (confirm("Are you sure you want to delete this website? This action cannot be undone.")) {
            const res = await deleteWebsite(name);
            if (res.success) {
                fetchWebsites();
            } else {
                alert("Failed to delete website: " + res.error);
            }
        }
    };

    const openEdit = (site: any) => {
        setEditingSite(site);
        setEditPhpVersion(site.php_version || "8.2");
        setEditPhpMode(site.php_mode || "Apache module");
    };

    const handleUpdate = async () => {
        if (!editingSite) return;
        setIsSaving(true);
        const res = await updateWebsite(editingSite.name, {
            php_version: editPhpVersion,
            php_mode: editPhpMode
        });
        if (res.success) {
            setEditingSite(null);
            fetchWebsites();
        } else {
            alert("Failed to update: " + res.error);
        }
        setIsSaving(false);
    };

    const handleCreate = async () => {
        if (!newDomain) return;
        setIsSaving(true);
        const res = await createWebsite({
            domain: newDomain,
            site_type: newType === "HTML" ? "HTML" : "CMS",
            cms_type: newType === "WordPress" ? "WordPress" : undefined,
            php_version: newPhp
        });

        if (res.success) {
            setShowCreate(false);
            setNewDomain("");
            fetchWebsites();
            alert("Website created successfully.");
        } else {
            alert("Failed to create: " + res.error);
        }
        setIsSaving(false);
    };

    const handleSSL = async (name: string) => {
        if (confirm("Issue/Renew SSL certificate? This may take a few moments.")) {
            const res = await issueSSL(name);
            if (res.success) {
                alert("SSL Issuance triggered. Check back in a few minutes.");
                fetchWebsites();
            } else {
                alert("Failed: " + res.error);
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0f1219] text-gray-200 font-sans">
            {/* <RPanelNav /> */}
            <main className="flex-1 p-8">
                <ServerInfoHeader info={serverInfo} loading={isLoadingInfo} />

                {/* Toolbar */}
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-1/3">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search"
                            className="pl-9 bg-[#1a1f36] border-gray-700 text-gray-200"
                            value={searchQuery}
                            onChange={(e: any) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-[#1a1f36] rounded-md border border-gray-700 p-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400'}
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400'}
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                        </div>

                        <Button onClick={() => setShowCreate(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Create site
                        </Button>
                    </div>
                </div>

                {/* Sites List/Grid */}
                {isLoading ? (
                    <div className="p-8 text-center text-gray-400">Loading websites...</div>
                ) : filteredWebsites.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No websites found.</div>
                ) : viewMode === 'list' ? (
                    /* ... Existing Table View ... */
                    <div className="rounded-lg border border-gray-700 bg-[#1a1f36] text-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-gray-400 font-medium border-b border-gray-700 bg-[#1a1f36]">
                                    <tr>
                                        <th className="px-6 py-4 font-normal">Domain</th>
                                        <th className="px-6 py-4 font-normal">Status</th>
                                        <th className="px-6 py-4 font-normal">PHP</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {filteredWebsites.map((site) => (
                                        <tr key={site.name} className="hover:bg-[#252b42] transition-colors">
                                            <td className="px-6 py-4 font-medium">{site.domain}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge status={site.status} compact={true} iconOnly={false} />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">PHP {site.php_version}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => openEdit(site)}>Edit</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* Grid View - Matches Screenshot */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredWebsites.map((site) => (
                            <div
                                key={site.name}
                                className="group relative bg-[#1a1f36] rounded-xl border border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-64 flex flex-col items-center justify-center"
                            >
                                {/* Default View: Domain & Favicon/Image */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 group-hover:opacity-10 transition-opacity duration-300">
                                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-400">
                                        {site.site_type === 'CMS' ? <Database className="h-8 w-8" /> : <ExternalLink className="h-8 w-8" />}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-1">{site.domain}</h3>
                                    <p className="text-sm text-gray-400">{site.php_version ? `PHP ${site.php_version}` : 'Static HTML'}</p>
                                    <div className="mt-4">
                                        <StatusBadge status={site.status} />
                                    </div>
                                </div>

                                {/* Hover Overlay Actions */}
                                <div className="absolute inset-0 bg-[#1a1f36]/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center z-10 p-4">
                                    <div className="border border-white/20 rounded-full px-6 py-2 mb-8 text-white font-medium tracking-wide">
                                        Site card
                                    </div>

                                    <div className="grid grid-cols-4 gap-4 w-full px-2">
                                        <div
                                            className="flex flex-col items-center gap-2 cursor-pointer hover:text-blue-400 transition-colors"
                                            onClick={() => window.location.href = `/rpanel/emails?domain=${site.domain}`}
                                        >
                                            <Mail className="h-6 w-6" />
                                            <span className="text-xs font-medium">Mail</span>
                                        </div>
                                        <div
                                            className="flex flex-col items-center gap-2 cursor-pointer hover:text-blue-400 transition-colors"
                                            onClick={() => window.location.href = `/rpanel/websites/${site.name}/logs`}
                                        >
                                            <FileText className="h-6 w-6" />
                                            <span className="text-xs font-medium">Logs</span>
                                        </div>
                                        <div
                                            className="flex flex-col items-center gap-2 cursor-pointer hover:text-blue-400 transition-colors"
                                            onClick={() => window.location.href = `/rpanel/websites/${site.name}/files`}
                                        >
                                            <Folder className="h-6 w-6" />
                                            <span className="text-xs font-medium">Files</span>
                                        </div>
                                        <div
                                            className="flex flex-col items-center gap-2 cursor-pointer hover:text-blue-400 transition-colors"
                                            onClick={() => window.location.href = `/rpanel/websites/${site.name}`}
                                        >
                                            <Settings className="h-6 w-6" />
                                            <span className="text-xs font-medium">Options</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Domain Label (Matches Screenshot style) */}
                                <div className="absolute bottom-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                    <ImageIcon className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-semibold text-white">{site.domain}</span>
                                </div>

                                {/* Top Right Actions (Matches Screenshot) */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                    <div className="p-1.5 bg-teal-500 rounded-full text-white cursor-pointer" title="SSL">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <div className="p-1.5 bg-orange-500 rounded-full text-white cursor-pointer" title="Visit">
                                        <ExternalLink className="h-4 w-4" />
                                    </div>
                                </div>

                                {/* Top Left Actions (Matches Screenshot) */}
                                <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 text-gray-400">
                                    <div className="p-1 cursor-pointer hover:text-white" title="Move">
                                        <RefreshCw className="h-4 w-4" />
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}

                {/* Edit Modal */}
                <Dialog open={!!editingSite} onOpenChange={(open) => !open && setEditingSite(null)}>
                    <DialogContent className="bg-[#1a1f36] border-gray-700 text-gray-200">
                        <DialogHeader>
                            <DialogTitle>Edit Website: {editingSite?.domain}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">PHP Version</label>
                                <Select value={editPhpVersion} onValueChange={setEditPhpVersion}>
                                    <SelectTrigger className="bg-[#0f1219] border-gray-600 text-white">
                                        <SelectValue placeholder="Select version" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1f36] border-gray-600 text-white">
                                        <SelectItem value="8.3">PHP 8.3</SelectItem>
                                        <SelectItem value="8.2">PHP 8.2</SelectItem>
                                        <SelectItem value="8.1">PHP 8.1</SelectItem>
                                        <SelectItem value="7.4">PHP 7.4</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">PHP Mode</label>
                                <Select value={editPhpMode} onValueChange={setEditPhpMode}>
                                    <SelectTrigger className="bg-[#0f1219] border-gray-600 text-white">
                                        <SelectValue placeholder="Select mode" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1f36] border-gray-600 text-white">
                                        <SelectItem value="Apache module">Apache module</SelectItem>
                                        <SelectItem value="PHP-FPM">PHP-FPM</SelectItem>
                                        <SelectItem value="Reverse proxy">Reverse proxy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setEditingSite(null)}>Cancel</Button>
                            <Button onClick={handleUpdate} disabled={isSaving}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Create Modal */}
                <Dialog open={showCreate} onOpenChange={setShowCreate}>
                    <DialogContent className="bg-[#1a1f36] border-gray-700 text-gray-200">
                        <DialogHeader>
                            <DialogTitle>Create New Website</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Domain Name</label>
                                <Input
                                    placeholder="example.com"
                                    value={newDomain}
                                    onChange={(e: any) => setNewDomain(e.target.value)}
                                    className="bg-[#0f1219] border-gray-600 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Site Type</label>
                                    <Select value={newType} onValueChange={setNewType}>
                                        <SelectTrigger className="bg-[#0f1219] border-gray-600 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1f36] border-gray-600 text-white">
                                            <SelectItem value="WordPress">WordPress</SelectItem>
                                            <SelectItem value="HTML">HTML</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">PHP Version</label>
                                    <Select value={newPhp} onValueChange={setNewPhp}>
                                        <SelectTrigger className="bg-[#0f1219] border-gray-600 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1f36] border-gray-600 text-white">
                                            <SelectItem value="8.3">PHP 8.3</SelectItem>
                                            <SelectItem value="8.2">PHP 8.2</SelectItem>
                                            <SelectItem value="8.1">PHP 8.1</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={isSaving}>Create Website</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
