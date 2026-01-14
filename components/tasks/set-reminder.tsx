"use client";

import { Message } from "ai";
import React from 'react';

import { Button } from "../ui/button";

interface SetReminderProps {
  taskId: string;
  append: (message: Message | Omit<Message, 'id'>) => Promise<string | null>;
}

export function SetReminder({ taskId, append }: SetReminderProps) {

  const handleSetReminder = (when: 'Today' | 'Tomorrow' | 'Next Week') => {
    const prompt = `Set a reminder for task ${taskId} for ${when}`;
    append({
      role: 'user',
      content: prompt,
    });
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-4 text-white">
      <p className="mb-4">Would you like to set a reminder for this task?</p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => handleSetReminder('Today')}>
          Today
        </Button>
        <Button variant="secondary" onClick={() => handleSetReminder('Tomorrow')}>
          Tomorrow
        </Button>
        <Button variant="secondary" onClick={() => handleSetReminder('Next Week')}>
          Next Week
        </Button>
      </div>
    </div>
  );
}
