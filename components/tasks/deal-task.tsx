"use client";

import React from 'react';

// Based on the DealTask model from backend/slingbolt.com/app/Models/DealTask.php
export interface DealTaskProps {
  id: number;
  name: string;
  priority: 'High' | 'Medium' | 'Low'; // Assuming priority levels
  date: string;
  time: string;
  onAccept?: (taskId: number) => void;
  onDone?: (taskId: number) => void;
  // More fields can be added as needed
}

export function DealTask({ task }: { task: DealTaskProps }) {
  const priority_color = {
    High: 'border-orange-500',
    Medium: 'border-yellow-500',
    Low: 'border-green-500',
  };

  return (
    <div className={`border-l-4 ${priority_color[task.priority]} bg-zinc-900 rounded-r-lg p-4 text-white w-full`}>
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg mb-2">{task.name}</h3>
        <span className="text-xs text-zinc-400">Due: {new Date(task.date).toLocaleDateString()} at {task.time}</span>
      </div>
      <p className="text-sm text-zinc-300 mb-4">A CRM-related task for a deal.</p>
      <div className="flex items-center justify-end">
        <div className="flex gap-2">
          {task.onAccept && (
            <button
              onClick={() => task.onAccept?.(task.id)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm">
              Accept
            </button>
          )}
          {task.onDone && (
            <button
              onClick={() => task.onDone?.(task.id)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm">
              Done
            </button>
          )}
            <button className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1 rounded-md text-sm">View Deal</button>
        </div>
      </div>
    </div>
  );
}
