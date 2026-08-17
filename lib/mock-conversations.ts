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

import { ElementType } from "react";

import { TaskStack } from "@/components/tasks/task-stack";

export const sampleTasks = [
  {
    type: "project",
    data: {
      id: 1,
      name: "Finalize Q3 marketing report",
      priority: "high",
      end_date: "2024-09-15T00:00:00Z",
      assignees: [],
    },
  },
  {
    type: "project",
    data: {
      id: 2,
      name: "Develop new landing page mockups",
      priority: "critical",
      end_date: "2024-09-10T00:00:00Z",
      assignees: [],
    },
  },
];

// For simple animations in the placeholder
export type PlaceholderStep = {
  type: "placeholder";
  id: number;
  text: string;
};

// For complex, multi-turn conversations in the main view
export type ChatTurn = {
  id: string;
  userMessage: string;
  botResponse?: {
    text: string;
    Component?: ElementType;
    props?: any;
    action?: string;
    intent?: string;
  };
};

export type ChatConversation = {
  type: "chat";
  id: number;
  turns: ChatTurn[];
};

export type Conversation = PlaceholderStep | ChatConversation;

export const conversations: Conversation[] = [
  {
    type: "placeholder",
    id: 1,
    text: "Hire a personal assistant...",
  },

  {
    type: "chat",
    id: 4,
    turns: [
      {
        id: "task-1-user",
        userMessage: "do i have tasks assigned to me today?",
        botResponse: { text: "yes", action: "Check", intent: "Tasks" },
      },
      {
        id: "task-2-bot",
        userMessage: "",
        botResponse: { text: "here they are", action: "List", intent: "Tasks" },
      },
      {
        id: "task-3-bot",
        userMessage: "",
        botResponse: {
          text: "",
          Component: TaskStack,
          props: { initialTasks: sampleTasks },
          action: "Review",
          intent: "Tasks",
        },
      },
      {
        id: "task-4-user",
        userMessage: "accepted",
        botResponse: {
          text: "you have accepted all your tasks, i will remind you when they are due.",
          action: "Update",
          intent: "Tasks",
        },
      },
    ],
  },
];
