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
