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
