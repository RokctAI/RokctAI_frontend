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
