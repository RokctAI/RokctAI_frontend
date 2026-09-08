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

import React from "react";

export interface PersonalTaskProps {
  id: string;
  title: string;
  description?: string | null;
  reminder_at?: Date | null;
  onAccept?: (taskId: string) => void;
  onDone?: (taskId: string) => void;
}

export function PersonalTask({ task }: { task: PersonalTaskProps }) {
  return (
    <div className="border-l-4 border-wealth-green-500 bg-zinc-900 rounded-r-lg p-4 text-white w-full">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg mb-2">{task.title}</h3>
        {task.reminder_at && (
          <span className="text-xs text-zinc-400">
            Reminder: {new Date(task.reminder_at).toLocaleDateString()}
          </span>
        )}
      </div>
      {task.description && (
        <p className="text-sm text-zinc-300 mb-4">{task.description}</p>
      )}
      <div className="flex items-center justify-end gap-2">
        {task.onAccept && (
          <button
            onClick={() => task.onAccept?.(task.id)}
            className="bg-wealth-green-600 hover:bg-wealth-green-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Accept
          </button>
        )}
        {task.onDone && (
          <button
            onClick={() => task.onDone?.(task.id)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
