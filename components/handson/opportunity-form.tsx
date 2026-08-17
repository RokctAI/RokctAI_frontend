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
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createOpportunity,
  updateOpportunity,
  OpportunityData,
} from "@/app/actions/handson/all/crm/deals";
import { toast } from "sonner";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface OpportunityFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function OpportunityForm({
  initialData,
  isEdit = false,
}: OpportunityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // We only support 'Lead' or 'Customer' for simplicity here
  const [opportunityFrom, setOpportunityFrom] = useState<"Lead" | "Customer">(
    initialData?.opportunity_from || "Lead",
  );
  const [partyName, setPartyName] = useState(initialData?.party_name || "");
  const [status, setStatus] = useState(initialData?.status || "Open");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!partyName) {
      toast.error("Party Name is required");
      return;
    }

    setLoading(true);

    const payload: OpportunityData = {
      opportunity_from: opportunityFrom,
      party_name: partyName,
      status: status,
    };

    let result;
    if (isEdit) {
      result = await updateOpportunity(initialData.name, payload);
    } else {
      result = await createOpportunity(payload);
    }

    setLoading(false);

    if (result.success) {
      toast.success(isEdit ? "Opportunity updated" : "Opportunity created");
      router.push("/handson/all/commercial/crm/opportunities");
      router.refresh();
    } else {
      toast.error("Failed: " + result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/handson/all/commercial/crm/opportunities">
            <Button variant="outline" size="icon" type="button">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            {isEdit
              ? `Edit Opportunity: ${initialData.name}`
              : "New Opportunity"}
          </h1>
        </div>
        <Button type="submit" disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opportunity Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Opportunity From</Label>
            <RadioGroup
              value={opportunityFrom}
              onValueChange={(v: "Lead" | "Customer") => setOpportunityFrom(v)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Lead" id="r1" />
                <Label htmlFor="r1">Lead</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Customer" id="r2" />
                <Label htmlFor="r2">Customer</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="partyName">Party Name ({opportunityFrom})</Label>
            <Input
              id="partyName"
              placeholder={`Enter ${opportunityFrom} Name`}
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Quotation">Quotation</SelectItem>
                <SelectItem value="Converted">Converted</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
