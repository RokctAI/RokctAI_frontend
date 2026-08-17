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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createProject,
  updateProject,
  ProjectData,
} from "@/app/actions/handson/all/projects/projects";
import { toast } from "sonner";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";

interface ProjectFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function ProjectForm({ initialData, isEdit = false }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [projectName, setProjectName] = useState(
    initialData?.project_name || "",
  );
  const [status, setStatus] = useState(initialData?.status || "Open");
  const [priority, setPriority] = useState(initialData?.priority || "Medium");
  const [startDate, setStartDate] = useState(
    initialData?.expected_start_date || new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(initialData?.expected_end_date || "");
  const [percentComplete, setPercentComplete] = useState(
    initialData?.percent_complete || 0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName) {
      toast.error("Project Name is required");
      return;
    }

    setLoading(true);

    const payload: ProjectData = {
      project_name: projectName,
      status,
      priority,
      expected_start_date: startDate,
      expected_end_date: endDate,
      percent_complete: percentComplete,
    };

    let result;
    if (isEdit && initialData?.name) {
      result = await updateProject(initialData.name, payload);
    } else {
      result = await createProject(payload);
    }

    setLoading(false);

    if (result.success) {
      toast.success(isEdit ? "Project updated" : "Project created");
      router.push("/handson/all/work_management/projects");
      router.refresh();
    } else {
      toast.error("Failed: " + result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/handson/all/work_management/projects">
            <Button variant="outline" size="icon" type="button">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            {isEdit ? `Edit Project: ${initialData.name}` : "New Project"}
          </h1>
        </div>
        <Button type="submit" disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              placeholder="e.g. Website Overhaul"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Expected Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Expected End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex justify-between">
              <Label>Progress</Label>
              <span className="text-sm text-muted-foreground">
                {percentComplete}%
              </span>
            </div>
            <Slider
              defaultValue={[percentComplete]}
              max={100}
              step={1}
              onValueChange={(vals) => setPercentComplete(vals[0])}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
