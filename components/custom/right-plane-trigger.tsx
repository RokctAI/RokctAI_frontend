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

import { PanelRightOpen } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
// import { useAcceptedTasks } from '@/lib/context/accepted-tasks-context';

export function RightPlaneTrigger() {
  // const { acceptedTasks, toggleRightPlane } = useAcceptedTasks();

  return (
    <div className="lg:hidden">
      {/* <Button variant="outline" className="p-1.5 h-fit relative" onClick={toggleRightPlane}> */}
      <Button variant="outline" className="p-1.5 h-fit relative">
        <PanelRightOpen />
        {/* {acceptedTasks.length > 0 && (
          <span className="absolute -top-1 -right-1 flex size-3">
            <span className="animate-ping absolute inline-flex size-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-3 bg-sky-500"></span>
          </span>
        )} */}
      </Button>
    </div>
  );
}
