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
    const displayWhen = when === "next_week" ? "Next Week" : when === "tomorrow" ? "Tomorrow" : "Today";
    const prompt = `Set a reminder for task ${taskId} for ${displayWhen}`;
    append({
      role: "user",
      content: prompt,
    });
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-4 text-white">
      <p className="mb-4">{t("Would you like to set a reminder for this task?")}</p>
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
