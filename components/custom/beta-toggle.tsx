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
