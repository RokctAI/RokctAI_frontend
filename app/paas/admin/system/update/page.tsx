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

import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { triggerSystemUpdate } from "@/app/actions/paas/admin/system";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SystemUpdatePage() {
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    if (
      !confirm(
        "Are you sure you want to trigger a system update? This will run database migrations.",
      )
    )
      return;

    setLoading(true);
    try {
      const result = await triggerSystemUpdate();
      if (result.status === "success") {
        toast.success(result.message);
      } else {
        toast.error("Failed to trigger update");
      }
    } catch (error) {
      toast.error("An error occurred while triggering the update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Update</h2>
        <p className="text-muted-foreground">
          Manage system updates and migrations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update System</CardTitle>
          <CardDescription>
            Trigger a system update to apply the latest database changes and
            migrations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <RefreshCw className="size-4" />
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>
              For tenant sites, this action will only run database migrations
              (`frappe.migrate.migrate`). It will not update the codebase
              itself, which is managed by the platform.
            </AlertDescription>
          </Alert>

          <Button onClick={handleUpdate} disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Trigger Update
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
