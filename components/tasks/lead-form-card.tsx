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

import { useState } from "react";
import { createAiLead } from "@/app/actions/ai/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, UserPlus, CheckCircle, AlertCircle } from "lucide-react";

interface LeadFormCardProps {
  initialData?: {
    lead_name: string;
    organization?: string;
    email_id?: string;
    mobile_no?: string;
    id_number?: string;
  };
  onCallback?: (result: any) => void;
}

export function LeadFormCard({ initialData, onCallback }: LeadFormCardProps) {
  const [formData, setFormData] = useState({
    lead_name: initialData?.lead_name || "",
    organization: initialData?.organization || "",
    email_id: initialData?.email_id || "",
    mobile_no: initialData?.mobile_no || "",
    id_number: initialData?.id_number || "",
  });
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    const result = await createAiLead(formData as any);

    if (result.success) {
      setStatus("success");
      setMessage("Lead created successfully.");
      if (onCallback) onCallback(result);
    } else {
      setStatus("error");
      setMessage(result.error || "Failed to create lead.");
    }
  };

  if (status === "success") {
    return (
      <Card className="w-full max-w-md bg-green-50/50 border-green-200 backdrop-blur-sm">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
          <h3 className="font-semibold text-green-800 text-sm">Lead Created</h3>
          <p className="text-xs text-green-700">
            {formData.lead_name} has been added to the CRM.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <UserPlus className="h-4 w-4 text-cyan-500" />
          New CRM Lead
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3 pb-4">
          <div className="space-y-1">
            <Label
              htmlFor="lead_name"
              className="text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              Full Name
            </Label>
            <Input
              id="lead_name"
              value={formData.lead_name}
              onChange={(e) =>
                setFormData({ ...formData, lead_name: e.target.value })
              }
              placeholder="e.g. John Doe"
              className="h-8 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label
                htmlFor="email_id"
                className="text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Email
              </Label>
              <Input
                id="email_id"
                value={formData.email_id}
                onChange={(e) =>
                  setFormData({ ...formData, email_id: e.target.value })
                }
                placeholder="john@example.com"
                className="h-8 text-sm"
                type="email"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="id_number"
                className="text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                SA ID Number
              </Label>
              <Input
                id="id_number"
                value={formData.id_number}
                onChange={(e) =>
                  setFormData({ ...formData, id_number: e.target.value })
                }
                placeholder="13 digits"
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="organization"
              className="text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              Organization
            </Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) =>
                setFormData({ ...formData, organization: e.target.value })
              }
              placeholder="Company Name"
              className="h-8 text-sm"
            />
          </div>

          {status === "error" && (
            <div className="text-[10px] text-red-500 bg-red-50 p-2 rounded flex items-center gap-2">
              <AlertCircle className="h-3 w-3" /> {message}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <Button
            type="submit"
            className="w-full h-8 text-xs font-medium bg-cyan-600 hover:bg-cyan-700"
            disabled={status === "submitting"}
          >
            {status === "submitting" && (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            )}
            Create Lead
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
