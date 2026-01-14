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
        botResponse: { text: "yes", action: "Check", intent: "Tasks" }
      },
      {
        id: "task-2-bot",
        userMessage: "",
        botResponse: { text: "here they are", action: "List", intent: "Tasks" }
      },
      {
        id: "task-3-bot",
        userMessage: "",
        botResponse: { text: "", Component: TaskStack, props: { initialTasks: sampleTasks }, action: "Review", intent: "Tasks" }
      },
      {
        id: "task-4-user",
        userMessage: "accepted",
        botResponse: { text: "you have accepted all your tasks, i will remind you when they are due.", action: "Update", intent: "Tasks" }
      }
    ]
  },
];
