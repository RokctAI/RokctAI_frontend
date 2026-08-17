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
