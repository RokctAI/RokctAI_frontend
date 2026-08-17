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
