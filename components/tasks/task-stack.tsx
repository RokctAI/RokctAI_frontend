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

import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { toast } from "sonner";

// import { useAcceptedTasks } from "@/lib/context/accepted-tasks-context";

import { DealTask, DealTaskProps } from "./deal-task";
import { ProjectTask, ProjectTaskProps } from "./project-task";

type Task =
  | { type: "project"; data: ProjectTaskProps }
  | { type: "deal"; data: DealTaskProps };

interface TaskStackProps {
  initialTasks: Task[];
}

export function TaskStack({ initialTasks }: TaskStackProps) {
  const [tasks, setTasks] = useState(initialTasks);
  // const { addTask } = useAcceptedTasks();

  const handleAccept = async (taskId: number, updates?: any) => {
    const task = tasks.find((t) => t.data.id === taskId);
    if (!task) return;

    // Merge updates (e.g. project linking)
    const finalData = { ...task.data, ...updates };

    try {
      // Send to Backend
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        toast.success("Task Saved", {
          description: "This task has been synced to your project.",
        });
        setTasks((prevTasks) => prevTasks.filter((t) => t.data.id !== taskId));
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to save task");
      }
    } catch (e) {
      toast.error("Error saving task");
    }
  };

  if (tasks.length === 0) {
    return <div className="text-center text-zinc-500 p-4">No more tasks.</div>;
  }

  return (
    <div className="relative h-48 w-full">
      <AnimatePresence>
        {tasks.map((task, index) => {
          const isTop = index === tasks.length - 1;
          return (
            <motion.div
              key={task.data.id}
              className="absolute w-full"
              style={{
                zIndex: index,
                transform: `scale(${1 - (tasks.length - 1 - index) * 0.05}) translateY(-${(tasks.length - 1 - index) * 10}px)`,
              }}
              animate={{
                scale: 1 - (tasks.length - 1 - index) * 0.05,
                y: `-${(tasks.length - 1 - index) * 10}px`,
              }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className={!isTop ? "pointer-events-none" : ""}>
                {task.type === "project" ? (
                  <ProjectTask
                    task={{
                      ...task.data,
                      onAccept: isTop
                        ? (id, updates) => handleAccept(id, updates)
                        : undefined,
                    }}
                  />
                ) : (
                  <DealTask
                    task={{
                      ...task.data,
                      onAccept: isTop ? handleAccept : undefined,
                    }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
