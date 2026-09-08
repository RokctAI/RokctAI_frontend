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

import { useState } from "react";
import { toast } from "sonner";
import { toggleBetaMode } from "@/app/actions/handson/control/system/global-settings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function BetaToggle({ initialState }: { initialState: boolean }) {
  const [isBeta, setIsBeta] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const result = await toggleBetaMode();
      if (result.success) {
        setIsBeta(result.isBetaMode!);
        toast.success(
          `Beta mode ${result.isBetaMode ? "enabled" : "disabled"}`,
        );
      } else {
        toast.error("Failed to toggle beta mode");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="beta-mode"
        checked={isBeta}
        onCheckedChange={handleToggle}
        disabled={isLoading}
      />
      <Label htmlFor="beta-mode">Beta Mode</Label>
    </div>
  );
}
