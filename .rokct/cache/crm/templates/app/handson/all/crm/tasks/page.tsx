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

import React from "react";
import Link from "next/link";
import { getTasks } from "@/app/actions/handson/all/crm/tasks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import t from "@/app/lib/i18n";
export default async function TasksPage() {
  const result = await getTasks(1, 50);
  const tasks = result.data;

  // Helper Initials
  const getInitials = (name: string) => {
    return (name || "?").substring(0, 2).toUpperCase();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive";
      case "Medium":
        return "secondary"; // or a custom warning variant if available
      default:
        return "outline";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("crm.tasks")}</h1>
          <p className="text-muted-foreground">
            {t("crm.manage_your_daily_tasks_and_priorities")}
          </p>
        </div>
        <Button asChild>
          <Link href="/handson/all/crm/tasks/new">{t("crm.create_task")}</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("crm.all_tasks")}</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              {t("crm.no_tasks_found")}
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm text-left">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      {t("crm.title")}
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      {t("crm.assigned_to")}
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      {t("crm.priority")}
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      {t("crm.due_date")}
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      {t("crm.status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {tasks.map((task: any) => (
                    <tr
                      key={task.name}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle font-medium">
                        {task.title}
                      </td>
                      <td className="p-4 align-middle">
                        {task.assigned_to ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px]">
                                {getInitials(task.assigned_to)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {task.assigned_to}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant={getPriorityColor(task.priority) as any}>
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant="outline">{task.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
