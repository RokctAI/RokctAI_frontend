/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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
  push: (
    text: string,
    type: "success" | "alert" | "info" = "info",
    icon?: ReactNode,
    duration = 5000,
  ) => {
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
