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
import { useState } from "react";
import Link from "next/link";
import { RiAddLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { createTask } from "@/app/actions/handson/all/projects/tasks";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import tr from "@/app/lib/i18n";
export function TaskList({ tasks }: { tasks: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = tasks.filter((t) =>
    t.subject?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{tr("productivity.tasks")}</h1>
          <p className="text-muted-foreground">{tr("productivity.manage_project_tasks")}</p>
        </div>
        <Link href="/handson/all/work_management/projects/task/new">
          <Button>
            <RiAddLine className="mr-2 h-4 w-4" /> {tr("productivity.new_task")}
          </Button>
        </Link>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tr("productivity.subject")}</TableHead>
              <TableHead>{tr("productivity.project")}</TableHead>
              <TableHead>{tr("productivity.status")}</TableHead>
              <TableHead>{tr("productivity.priority")}</TableHead>
              <TableHead>{tr("productivity.due_date")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t.name}>
                <TableCell className="font-medium">{t.subject}</TableCell>
                <TableCell>{t.project}</TableCell>
                <TableCell>
                  <Badge variant="outline">{t.status}</Badge>
                </TableCell>
                <TableCell>{t.priority}</TableCell>
                <TableCell>{t.exp_end_date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function TaskForm() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [project, setProject] = useState("");
  const [status, setStatus] = useState("Open");
  const [priority, setPriority] = useState("Medium");

  const handleSubmit = async () => {
    const res = await createTask({ subject, project, status, priority });
    if (res.success) {
      toast.success("Task Created");
      router.push("/handson/all/work_management/projects/task");
    } else toast.error(res.error);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{tr("productivity.new_task")}</h1>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div>
            <Label>{tr("productivity.subject")}</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <Label>{tr("productivity.project_optional")}</Label>
            <Input
              value={project}
              onChange={(e) => setProject(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>{tr("productivity.status")}</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">{tr("productivity.open")}</SelectItem>
                  <SelectItem value="Working">{tr("productivity.working")}</SelectItem>
                  <SelectItem value="Completed">{tr("productivity.completed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>{tr("productivity.priority")}</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">{tr("productivity.low")}</SelectItem>
                  <SelectItem value="Medium">{tr("productivity.medium")}</SelectItem>
                  <SelectItem value="High">{tr("productivity.high")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSubmit}>{tr("productivity.create_task")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
