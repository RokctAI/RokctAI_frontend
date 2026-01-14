"use client";

import React, { useEffect, useState } from "react";
import { HardDrive, Globe, Database, Mail } from "lucide-react";
import { getClientUsage } from "@/app/actions/handson/control/rpanel/dashboard/get-client-usage";
import { getServerInfo } from "@/app/actions/handson/control/rpanel/dashboard/get-server-info";
// import { RPanelNav } from "@/components/custom/nav/rpanel-nav"; // Removing as it's now part of Control Layout
import { ServerInfoHeader } from "@/components/custom/rpanel/server-info-header";
import { StatCard } from "@/components/custom/rpanel/stat-card";

export default function OverviewPage() {
  const [usage, setUsage] = useState<any>(null);
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [usageRes, infoRes] = await Promise.all([
        getClientUsage(),
        getServerInfo()
      ]);

      if (usageRes.message?.success) {
        setUsage(usageRes.message.usage);
      }
      if (infoRes.message?.success) {
        setServerInfo(infoRes.message);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f1219] text-gray-200 font-sans">
      {/* <RPanelNav /> Removed */}
      <main className="flex-1 p-8">
        <ServerInfoHeader info={serverInfo} loading={isLoading} />

        <h2 className="text-2xl font-bold mb-6">Overview</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Websites"
            value={usage?.websites?.used || 0}
            limit={usage?.websites?.limit}
            icon={<Globe className="h-4 w-4 text-blue-400" />}
            loading={isLoading}
          />
          <StatCard
            title="Databases"
            value={usage?.databases?.used || 0}
            limit={usage?.databases?.limit}
            icon={<Database className="h-4 w-4 text-green-400" />}
            loading={isLoading}
          />
          <StatCard
            title="Emails"
            value={usage?.emails?.used || 0}
            limit={usage?.emails?.limit} // Assuming api returns this
            icon={<Mail className="h-4 w-4 text-purple-400" />}
            loading={isLoading}
          />
          <StatCard
            title="Disk Usage"
            value={usage?.storage_gb?.used ? `${usage.storage_gb.used} GB` : "0 GB"}
            limit={usage?.storage_gb?.limit ? `${usage.storage_gb.limit} GB` : "∞"}
            icon={<HardDrive className="h-4 w-4 text-orange-400" />}
            loading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}
