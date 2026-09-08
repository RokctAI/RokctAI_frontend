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

import { Message } from "ai";
import React from "react";

import { Button } from "../ui/button";

interface DisambiguateTaskProps {
  taskTitle: string;
  append: (message: Message | Omit<Message, "id">) => Promise<string | null>;
}

export function DisambiguateTask({ taskTitle, append }: DisambiguateTaskProps) {
  const handleSelectTaskType = (taskType: "Project" | "CRM" | "Personal") => {
    const clarifiedPrompt = `Create a ${taskType} task: ${taskTitle}`;
    append({
      role: "user",
      content: clarifiedPrompt,
    });
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-4 text-white">
      <p className="mb-4">
        I can create a task for you: &quot;{taskTitle}&quot;. First, please
        clarify the task type:
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => handleSelectTaskType("Project")}
        >
          Project Task
        </Button>
        <Button variant="secondary" onClick={() => handleSelectTaskType("CRM")}>
          CRM Task
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleSelectTaskType("Personal")}
        >
          Personal Task
        </Button>
      </div>
    </div>
  );
}
