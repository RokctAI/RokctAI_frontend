"use client";

import { ReactNode } from "react";

// Event Bus for AI Status Notifications
type Notification = {
    id: string;
    text: string;
    type?: "success" | "alert" | "info";
    icon?: ReactNode;
    duration?: number;
};

type Listener = (notifications: Notification[]) => void;

let listeners: Listener[] = [];
let queue: Notification[] = [];

export const aiStore = {
    // Subscribe to changes
    subscribe: (listener: Listener) => {
        listeners.push(listener);
        listener(queue); // Initial emit
        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    },

    // Push a new notification
    push: (text: string, type: "success" | "alert" | "info" = "info", icon?: ReactNode, duration = 5000) => {
        const id = Math.random().toString(36).substring(7);
        const notification: Notification = { id, text, type, icon, duration };

        // Add to queue
        queue = [...queue, notification];
        emit();

        // Auto-remove after duration (optional, but Pill handles its own cycling)
        // We let the Pill consume the queue.
    },

    // Consume (remove) the first item
    consume: () => {
        if (queue.length > 0) {
            const [_, ...rest] = queue;
            queue = rest;
            emit();
        }
    },

    getQueue: () => queue,
};

function emit() {
    listeners.forEach((listener) => listener(queue));
}
