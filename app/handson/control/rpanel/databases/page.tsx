/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use client";

import React, { useEffect, useState, Suspense } from "react";
import {
  Database,
  Search,
  MoreVertical,
  KeyRound,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import {
  getDatabases,
  updateDatabasePassword,
} from "@/app/actions/handson/control/rpanel/databases/manage-database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";
import t from "@/app/lib/i18n";

function DatabasesContent() {
  const searchParams = useSearchParams();
  const websiteFilter = searchParams.get("website") || "";

  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(websiteFilter); // Initialize with filter

  // Password Change State
  const [editingDb, setEditingDb] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchDbs() {
      setLoading(true);
      const res = await getDatabases();
      if (res.message?.success) {
        setDatabases(res.message.databases);
      }
      setLoading(false);
    }
    fetchDbs();
  }, []);

  const filteredDbs = databases.filter(
    (db) =>
      db.db_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      db.db_user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (db.domain &&
        db.domain.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (db.name && db.name.toLowerCase().includes(searchQuery.toLowerCase())), // Filter by website ID too
  );

  const handlePasswordUpdate = async () => {
    if (!editingDb) return;
    setIsSaving(true);
    const res = await updateDatabasePassword(editingDb.name, newPassword);
    if (res.success) {
      setEditingDb(null);
      setNewPassword("");
      alert("Password updated successfully.");
    } else {
      alert("Failed to update password: " + res.error);
    }
    setIsSaving(false);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6 text-green-500" />{" "}
          {t("common.databases")}
        </h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder={t("common.search_databases")}
            className="pl-9 bg-[#1a1f36] border-gray-700 text-gray-200"
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border border-gray-700 bg-[#1a1f36] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            {t("common.loading")}
          </div>
        ) : filteredDbs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {t("common.no_data")}
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 font-medium border-b border-gray-700 bg-[#1a1f36]">
              <tr>
                <th className="px-6 py-4 font-normal">
                  {t("common.database_name")}
                </th>
                <th className="px-6 py-4 font-normal">
                  {t("common.database_user")}
                </th>
                <th className="px-6 py-4 font-normal">{t("common.host")}</th>
                <th className="px-6 py-4 font-normal">{t("common.website")}</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredDbs.map((db) => (
                <tr
                  key={db.name}
                  className="hover:bg-[#252b42] transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {db.db_name}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{db.db_user}</td>
                  <td className="px-6 py-4 text-gray-400">
                    {db.host || "localhost"}
                  </td>
                  <td className="px-6 py-4 text-blue-400">{db.domain}</td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingDb(db)}
                      title="Change Password" // placeholder
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog
        open={!!editingDb}
        onOpenChange={(open) => !open && setEditingDb(null)}
      >
        <DialogContent className="bg-[#1a1f36] border-gray-700 text-gray-200">
          <DialogHeader>
            <DialogTitle>
              {t("common.change_password")}: {editingDb?.db_user}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <label className="text-sm font-medium text-gray-400">
              {t("common.new_password")}
            </label>
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
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingDb(null)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordUpdate} disabled={isSaving}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function DatabasesPage() {
  return (
    <div className="flex min-h-screen bg-[#0f1219] text-gray-200 font-sans">
      {/* <RPanelNav /> */}
      <main className="flex-1 p-8">
        <Suspense
          fallback={
            <div className="p-8 text-center text-gray-400">Loading...</div>
          }
        >
          <DatabasesContent />
        </Suspense>
      </main>
    </div>
  );
}
