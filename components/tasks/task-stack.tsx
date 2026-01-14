"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { toast } from "sonner";

// import { useAcceptedTasks } from "@/lib/context/accepted-tasks-context";

import { DealTask, DealTaskProps } from "./deal-task";
import { ProjectTask, ProjectTaskProps } from "./project-task";

type Task =
  | { type: 'project'; data: ProjectTaskProps }
  | { type: 'deal'; data: DealTaskProps };

interface TaskStackProps {
  initialTasks: Task[];
}

export function TaskStack({ initialTasks }: TaskStackProps) {
  const [tasks, setTasks] = useState(initialTasks);
  // const { addTask } = useAcceptedTasks();

  const handleAccept = async (taskId: number, updates?: any) => {
    const task = tasks.find(t => t.data.id === taskId);
    if (!task) return;

    // Merge updates (e.g. project linking)
    const finalData = { ...task.data, ...updates };

    try {
      // Send to Backend
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
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
    return (
      <div className="text-center text-zinc-500 p-4">
        No more tasks.
      </div>
    );
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
              <div className={!isTop ? 'pointer-events-none' : ''}>
                {task.type === 'project' ? (
                  <ProjectTask task={{ ...task.data, onAccept: isTop ? (id, updates) => handleAccept(id, updates) : undefined }} />
                ) : (
                  <DealTask task={{ ...task.data, onAccept: isTop ? handleAccept : undefined }} />
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
