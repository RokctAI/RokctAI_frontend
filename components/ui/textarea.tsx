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

import * as React from "react";

import { cn } from "@/lib/utils";
import { AiTextHelper } from "@/components/handson/ai/AiTextHelper";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  enableAi?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, enableAi = true, ...props }, ref) => {
    // We need to control the value internally if we want to update it from AI,
    // but the parent usually controls it via props.value.
    // However, AiTextHelper requires 'text' and 'onAccept'.
    // If props.value and props.onChange are provided (Controlled Component), we use them.

    // Safety check for controlled vs uncontrolled
    const isControlled = props.value !== undefined;

    // We only enable AI helper if it's a controlled component or strict requirements met,
    // otherwise the onAccept logic is tricky without a setValue.
    // For now, let's assume standard usage: value + onChange.

    const handleAiAccept = (newText: string) => {
      if (props.onChange) {
        // Mock an event object to notify parent
        const event = {
          target: { value: newText },
          currentTarget: { value: newText },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        props.onChange(event);
      }
    };

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
        {enableAi && isControlled && (
          <div className="absolute top-2 right-2 z-10">
            <AiTextHelper
              text={String(props.value || "")}
              onAccept={handleAiAccept}
              className="opacity-50 hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm"
            />
          </div>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
