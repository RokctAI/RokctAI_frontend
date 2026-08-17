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
