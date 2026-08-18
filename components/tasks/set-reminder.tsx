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

import t from "@/app/lib/i18n";

interface SetReminderProps {
  taskId: string;
  append: (message: Message | Omit<Message, "id">) => Promise<string | null>;
}

export function SetReminder({ taskId, append }: SetReminderProps) {
  const handleSetReminder = (when: "today" | "tomorrow" | "next_week") => {
    const displayWhen =
      when === "next_week"
        ? "Next Week"
        : when === "tomorrow"
          ? "Tomorrow"
          : "Today";
    const prompt = `Set a reminder for task ${taskId} for ${displayWhen}`;
    append({
      role: "user",
      content: prompt,
    });
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-4 text-white">
      <p className="mb-4">
        {t("Would you like to set a reminder for this task?")}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => handleSetReminder("today")}>
          {t("Today")}
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleSetReminder("tomorrow")}
        >
          {t("Tomorrow")}
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleSetReminder("next_week")}
        >
          {t("Next Week")}
        </Button>
      </div>
    </div>
  );
}
