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

// [SDK-MANAGED] The canonical copy of this file lives in the tender module
// (corporate/tender/nextjs/templates/...). Edits here should be mirrored there.

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  getTenderControlSettings,
  getGeneratedTenderTasks,
  getTenderWorkflowTasks,
  getTenderWorkflowTemplates,
  getIntelligentTaskSets,
  deleteGeneratedTenderTask,
  deleteTenderWorkflowTask,
  deleteTenderWorkflowTemplate,
  deleteIntelligentTaskSet,
} from "@/app/actions/handson/control/tender/tender";

export default function TenderPage() {
  // "Tender Control Settings" is a Single doctype — one document, not a list.
  const [settings, setSettings] = useState<any | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [workflowTasks, setWorkflowTasks] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [taskSets, setTaskSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const [settingsData, tasksData, wfTasksData, templatesData, setsData] =
        await Promise.all([
          getTenderControlSettings(),
          getGeneratedTenderTasks(),
          getTenderWorkflowTasks(),
          getTenderWorkflowTemplates(),
          getIntelligentTaskSets(),
        ]);
      setSettings(settingsData || null);
      setTasks(tasksData || []);
      setWorkflowTasks(wfTasksData || []);
      setTemplates(templatesData || []);
      setTaskSets(setsData || []);
    } catch (error) {
      console.error("Error fetching tender data:", error);
      toast.error("Failed to fetch tender data");
    } finally {
      setLoading(false);
    }
  }

  // Child-table rows are deleted through their parent document, so the
  // handlers carry the parent name alongside the row name.
  async function handleDeleteTask(taskSet: string, name: string) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteGeneratedTenderTask(taskSet, name);
      toast.success("Task deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete task");
    }
  }

  async function handleDeleteWorkflowTask(template: string, name: string) {
    if (!confirm("Are you sure you want to delete this workflow task?")) return;
    try {
      await deleteTenderWorkflowTask(template, name);
      toast.success("Workflow task deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete workflow task");
    }
  }

  async function handleDeleteTemplate(name: string) {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await deleteTenderWorkflowTemplate(name);
      toast.success("Template deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete template");
    }
  }

  async function handleDeleteTaskSet(name: string) {
    if (!confirm("Are you sure you want to delete this task set?")) return;
    try {
      await deleteIntelligentTaskSet(name);
      toast.success("Task set deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete task set");
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tender & Tasks Management</h1>
          <p className="text-muted-foreground">
            Control tender workflows, tasks, and settings.
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchData}
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="settings">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="tasks">Generated Tasks</TabsTrigger>
          <TabsTrigger value="workflow-tasks">Workflow Tasks</TabsTrigger>
          <TabsTrigger value="templates">Workflow Templates</TabsTrigger>
          <TabsTrigger value="intelligent-sets">
            Intelligent Task Sets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tender Control Settings</CardTitle>
              <CardDescription>Global tender configuration.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Tender Country</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!settings ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center h-24 text-muted-foreground"
                      >
                        No settings found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={settings.name}>
                      <TableCell className="font-medium">
                        {settings.name}
                      </TableCell>
                      <TableCell>{settings.tender_country}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Tender Tasks</CardTitle>
              <CardDescription>Tasks generated from tenders.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Task Set</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Due Offset (Days)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center h-24 text-muted-foreground"
                      >
                        No tasks found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tasks.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.parent}</TableCell>
                        <TableCell>{item.subject}</TableCell>
                        <TableCell>{item.due_date_offset_days}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() =>
                              handleDeleteTask(item.parent, item.name)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow-tasks" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tender Workflow Tasks</CardTitle>
              <CardDescription>
                Individual tasks within workflows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Due Offset (Days)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflowTasks.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center h-24 text-muted-foreground"
                      >
                        No workflow tasks found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    workflowTasks.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.parent}</TableCell>
                        <TableCell>{item.subject}</TableCell>
                        <TableCell>{item.due_date_offset_days}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() =>
                              handleDeleteWorkflowTask(item.parent, item.name)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tender Workflow Templates</CardTitle>
              <CardDescription>Templates for tender workflows.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center h-24 text-muted-foreground"
                      >
                        No templates found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    templates.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.template_name}</TableCell>
                        <TableCell>{item.owner}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteTemplate(item.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intelligent-sets" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Intelligent Task Sets</CardTitle>
              <CardDescription>Sets of intelligent tasks.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>OCID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taskSets.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center h-24 text-muted-foreground"
                      >
                        No task sets found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    taskSets.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.ocid}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteTaskSet(item.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
