/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, ListTodo, StickyNote, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartInputProps {
  value: string;
  onChange: (value: string) => void;
  onIntentChange?: (intent: "Task" | "Note" | "Unknown") => void;
  className?: string;
  placeholder?: string;
}

export function SmartInput({
  value,
  onChange,
  onIntentChange,
  className,
  placeholder,
}: SmartInputProps) {
  const [intent, setIntent] = useState<"Task" | "Note" | "Unknown">("Unknown");
  const [isThinking, setIsThinking] = useState(false);

  return (
    <div className={cn("relative group", className)}>
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={
          placeholder ||
          "What's on your mind? (e.g. 'Meeting with John tomorrow' or 'Idea for new logo')"
        }
        className="pr-24 min-h-[100px] resize-none transition-all focus:min-h-[120px]"
      />

      <div className="absolute bottom-2 right-2 flex items-center gap-2 pointer-events-none">
        {isThinking && (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        )}

        <Badge
          variant={
            intent === "Task"
              ? "default"
              : intent === "Note"
                ? "secondary"
                : "outline"
          }
          className={cn(
            "transition-all duration-300 ease-in-out",
            intent === "Unknown" && !value && "opacity-0",
          )}
        >
          {intent === "Task" && <ListTodo className="h-3 w-3 mr-1" />}
          {intent === "Note" && <StickyNote className="h-3 w-3 mr-1" />}
          {intent === "Unknown" && <Brain className="h-3 w-3 mr-1" />}
          {intent}
        </Badge>
      </div>
    </div>
  );
}
