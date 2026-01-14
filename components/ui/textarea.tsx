"use client";

import * as React from "react"

import { cn } from "@/lib/utils"
import { AiTextHelper } from "@/components/handson/ai/AiTextHelper";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
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
          currentTarget: { value: newText }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        props.onChange(event);
      }
    };

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
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
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
