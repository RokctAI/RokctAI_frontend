"use client";

import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import * as React from "react";

import { AI_MODELS } from "@/ai/models";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  selectedModelId: string;
  onModelChange: (id: string) => void;
  isPaidUser: boolean;
  onUpgradeClick: () => void;
  models?: any;
}

export function ModelSelector({
  selectedModelId,
  onModelChange,
  isPaidUser,
  onUpgradeClick,
  models: passedModels,
}: ModelSelectorProps) {
  const models = passedModels || AI_MODELS;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 px-3 py-1.5 h-9 text-sm font-medium border-zinc-200 dark:border-zinc-800"
        >
          <span>
            {selectedModelId === models.PAID.id
              ? models.PAID.label
              : models.FREE.label}
          </span>
          <ChevronDownIcon className="size-3 text-zinc-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuItem
          className="flex justify-between items-center cursor-pointer"
          onSelect={() => onModelChange(models.FREE.id)}
        >
          <div className="flex flex-col">
            <span className="font-medium">{models.FREE.label}</span>
            <span className="text-xs text-zinc-500">
              {models.FREE.description}
            </span>
          </div>
          {selectedModelId === models.FREE.id && (
            <CheckIcon className="size-4 text-emerald-500" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex justify-between items-center cursor-pointer"
          onSelect={(e) => {
            if (!isPaidUser) {
              e.preventDefault();
              onUpgradeClick();
            } else {
              onModelChange(models.PAID.id);
            }
          }}
        >
          <div className="flex flex-col">
            <span className="flex items-center gap-2">
              <span className="font-medium">{models.PAID.label}</span>
              {!isPaidUser && (
                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-sm font-medium text-zinc-500">
                  PRO
                </span>
              )}
            </span>
            <span className="text-xs text-zinc-500">
              {models.PAID.description}
            </span>
          </div>
          {selectedModelId === models.PAID.id && (
            <CheckIcon className="size-4 text-emerald-500" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
