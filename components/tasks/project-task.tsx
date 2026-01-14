"use client";

import { UserCircle2 } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { getProjects } from "@/app/actions/handson/all/projects/projects";

export interface ProjectTaskProps {
  id: number;
  name: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  end_date?: string;
  assignees: Array<{ id: number; name: string; avatar: string }>;
  onAccept?: (taskId: number, updates?: any) => void;
  onDone?: (taskId: number) => void;
  // More fields can be added as needed
}

export function ProjectTask({ task }: { task: ProjectTaskProps }) {
  const [isSelectingProject, setIsSelectingProject] = React.useState(false);
  const [projects, setProjects] = React.useState<any[]>([]);
  const [selectedProject, setSelectedProject] = React.useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = React.useState<string | undefined>(task.end_date);

  React.useEffect(() => {
    if (isSelectingProject && projects.length === 0) {
      getProjects().then(res => setProjects(res));
    }
  }, [isSelectingProject]);

  const priority_color = {
    critical: 'border-red-500',
    high: 'border-orange-500',
    medium: 'border-blue-500',
    low: 'border-green-500',
  };


  const [isSelectingUser, setIsSelectingUser] = React.useState(false);
  const [users, setUsers] = React.useState<any[]>([]);
  const [selectedAssignee, setSelectedAssignee] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (isSelectingUser && users.length === 0) {
      // Lazy load users
      import("@/app/actions/handson/all/hrms/employees").then(mod => {
        mod.getEmployees().then(res => setUsers(res.map((e: any) => ({ email: e.user_id, full_name: e.employee_name }))));
      });
    }
  }, [isSelectingUser]);

  return (
    <div className={`border-l-4 ${priority_color[task.priority]} bg-zinc-900 rounded-r-lg p-4 text-white w-full`}>
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg mb-2">{task.name}</h3>
        <div className="flex flex-col items-end">
          {selectedDate ? (
            <span className="text-xs text-zinc-400">Due: {new Date(selectedDate).toLocaleDateString()}</span>
          ) : (
            <input
              type="date"
              className="bg-transparent text-xs text-zinc-500 border-none outline-none focus:ring-0 w-24"
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2 overflow-hidden items-center">
          {/* Show Selected Assignee Avatar if picked locally, else task assignees */}
          {selectedAssignee ? (
            <div className="inline-flex items-center justify-center size-8 rounded-full ring-2 ring-zinc-900 bg-blue-600 text-xs font-bold">
              {users.find(u => u.email === selectedAssignee)?.full_name?.charAt(0) || "U"}
            </div>
          ) : (
            task.assignees.length > 0 ? task.assignees.map(assignee => (
              assignee.avatar ? (
                <Image key={assignee.id} className="inline-block size-8 rounded-full ring-2 ring-zinc-900" src={assignee.avatar} alt={assignee.name} width={32} height={32} />
              ) : (
                <div key={assignee.id} className="inline-flex items-center justify-center size-8 rounded-full ring-2 ring-zinc-900 bg-zinc-700">
                  <UserCircle2 className="size-6 text-zinc-400" />
                </div>
              )
            )) : (
              <span className="text-xs text-zinc-500 italic mr-2">Unassigned</span>
            )
          )}
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {task.onAccept && (
            <div className="flex gap-2 items-center">
              {/* Project Linker */}
              {!isSelectingProject ? (
                <button
                  onClick={() => setIsSelectingProject(true)}
                  className="bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1 rounded text-xs"
                >
                  Link Project
                </button>
              ) : (
                <select
                  className="bg-zinc-800 text-white text-xs border border-zinc-600 rounded px-1 py-1 max-w-[100px]"
                  onChange={(e) => setSelectedProject(e.target.value)}
                  value={selectedProject || ""}
                >
                  <option value="">Project...</option>
                  {projects.map((p: any) => (
                    <option key={p.name} value={p.name}>{p.project_name}</option>
                  ))}
                </select>
              )}

              {/* User Assigner */}
              {!isSelectingUser ? (
                <button onClick={() => setIsSelectingUser(true)} className="bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1 rounded text-xs">
                  Assign
                </button>
              ) : (
                <select
                  className="bg-zinc-800 text-white text-xs border border-zinc-600 rounded px-1 py-1 max-w-[100px]"
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  value={selectedAssignee || ""}
                >
                  <option value="">User...</option>
                  {users.map((u: any) => (
                    <option key={u.email} value={u.email}>{u.full_name || u.email}</option>
                  ))}
                </select>
              )}

              <button
                onClick={() => task.onAccept?.(task.id, { project: selectedProject, assignee: selectedAssignee, end_date: selectedDate })}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
                Accept
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
