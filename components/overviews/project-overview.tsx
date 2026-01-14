"use client";

import { UserCircle2 } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

// Based on the Project model from backend/slingbolt.com/app/Models/Project.php
export interface ProjectOverviewProps {
  id: number;
  project_name: string;
  status: 'in_progress' | 'on_hold' | 'complete' | 'canceled';
  budget: number;
  progress: number; // Percentage
  users: Array<{ id: number; name: string; avatar: string }>;
  task_count: number;
}

export function ProjectOverview({ project }: { project: ProjectOverviewProps }) {
  const status_color = {
    on_hold: 'bg-yellow-500',
    in_progress: 'bg-blue-500',
    complete: 'bg-green-500',
    canceled: 'bg-red-500',
  };

  const status_text = {
    on_hold: 'On Hold',
    in_progress: 'In Progress',
    complete: 'Complete',
    canceled: 'Canceled',
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-white w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-xl">{project.project_name}</h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${status_color[project.status]}`}>
          {status_text[project.status]}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-zinc-400 mb-1">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-zinc-700 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center text-center mb-4 border-y border-zinc-800 py-3">
        <div>
          <p className="text-lg font-semibold">${new Intl.NumberFormat().format(project.budget)}</p>
          <p className="text-xs text-zinc-400">Budget</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{project.task_count}</p>
          <p className="text-xs text-zinc-400">Tasks</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{project.users.length}</p>
          <p className="text-xs text-zinc-400">Members</p>
        </div>
      </div>

      {/* Team Avatars */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2 overflow-hidden">
          {project.users.map(user => (
            user.avatar ? (
              <Image key={user.id} className="inline-block size-8 rounded-full ring-2 ring-zinc-900" src={user.avatar} alt={user.name} width={32} height={32} />
            ) : (
              <div key={user.id} className="inline-flex items-center justify-center size-8 rounded-full ring-2 ring-zinc-900 bg-zinc-700">
                <UserCircle2 className="size-6 text-zinc-400" />
              </div>
            )
          ))}
        </div>
        <button className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1 rounded-md text-sm">View Project</button>
      </div>
    </div>
  );
}
