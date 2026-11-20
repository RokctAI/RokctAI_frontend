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
import { useRouter } from "next/navigation";
import { createTimesheet } from "@/app/actions/handson/all/projects/timesheets";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import tr from "@/app/lib/i18n";
export function TimesheetList({ items }: { items: any[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{tr("productivity.timesheets")}</h1>
          <p className="text-muted-foreground">{tr("productivity.log_time")}</p>
        </div>
        <Link href="/handson/all/work_management/projects/timesheet/new">
          <Button>
            <RiAddLine className="mr-2 h-4 w-4" /> {tr("productivity.log_time")}
          </Button>
        </Link>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tr("productivity.name")}</TableHead>
              <TableHead>{tr("productivity.start_date")}</TableHead>
              <TableHead>{tr("productivity.total_hours")}</TableHead>
              <TableHead>{tr("productivity.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((t) => (
              <TableRow key={t.name}>
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.start_date}</TableCell>
                <TableCell>{t.total_hours}</TableCell>
                <TableCell>{t.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function TimesheetForm() {
  const router = useRouter();
  const [activity, setActivity] = useState("");
  const [hours, setHours] = useState(0);
  const [project, setProject] = useState("");

  const handleSubmit = async () => {
    // Submit timesheet entry
    const res = await createTimesheet({
      company: "Juvo",
      time_logs: [{ activity_type: activity, hours: hours, project }],
    });
    if (res.success) {
      toast.success("Timesheet Submitted");
      router.push("/handson/all/work_management/projects/timesheet");
    } else toast.error(res.error);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{tr("productivity.new_timesheet")}</h1>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div>
            <Label>{tr("productivity.activity_type")}</Label>
            <Input
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="e.g. Development"
            />
          </div>
          <div>
            <Label>{tr("productivity.hours")}</Label>
            <Input
              type="number"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>{tr("productivity.project_optional")}</Label>
            <Input
              value={project}
              onChange={(e) => setProject(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit}>{tr("productivity.submit")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
