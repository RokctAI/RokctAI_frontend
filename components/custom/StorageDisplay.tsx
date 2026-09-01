/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use client";

import { useEffect, useState } from "react";
import { Database } from "lucide-react";
import { getStorageUsage } from "@/app/actions/handson/tenant/system/storage";

export function StorageDisplay() {
  const [usage, setUsage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStorage() {
      const data = await getStorageUsage();
      setUsage(data);
      setLoading(false);
    }
    fetchStorage();
  }, []);

  if (loading) return null;

  // Logic: If usage is null (e.g. control site or error), show "Unlimited".
  // If usage is a number, show it formatted.
  const displayValue = usage !== null ? `${usage.toFixed(2)} MB` : "Unlimited";

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground px-2 py-1.5 rounded hover:bg-muted/50 transition-colors">
      <Database className="h-4 w-4" />
      <span>Storage: {displayValue}</span>
    </div>
  );
}
