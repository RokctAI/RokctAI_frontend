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

import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { AI_FIRST } from "@/app/config/compose";

import { Button } from "../ui/button";

export const HandsOnButton = ({ canUseAI = true }: { canUseAI?: boolean }) => {
  const router = useRouter();
  const pathname = usePathname();

  const isHandsOnPage = pathname === "/handson";

  // Compose-time gate: without the agent SDK there is no Auto (chat) mode to
  // switch to, so the toggle is not offered on the hands-on page at all.
  if (!AI_FIRST && isHandsOnPage) {
    return null;
  }

  const handleClick = () => {
    if (isHandsOnPage) {
      if (canUseAI) {
        router.push("/");
      } else {
        // Logic for upgrade (placeholder)
        toast.info("Upgrade Required", {
          description:
            "You need to upgrade your plan or add seats/quota to enable AI.",
        });
      }
    } else {
      router.push("/handson");
    }
  };

  let label = "Hands-On";
  if (isHandsOnPage) {
    label = canUseAI ? "Auto" : "Upgrade";
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick}>
      <div className="w-full text-left px-1 py-0.5">{label}</div>
    </Button>
  );
};
