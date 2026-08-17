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

import { Flame } from "lucide-react";

interface DashboardHeaderProps {
  fullName: string;
  streak: { current_streak: number } | null;
}

export function DashboardHeader({ fullName, streak }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hey,{" "}
          <a href="/handson/all/lms/me/profile" className="hover:underline">
            {fullName || "Student"}
          </a>{" "}
          👋
        </h1>
        <p className="text-gray-500 mt-1">Resume where you left off</p>
      </div>
      {streak && (
        <div className="bg-orange-100 flex items-center gap-2 px-3 py-1.5 rounded-full text-orange-700 font-medium">
          <Flame className="w-4 h-4" />
          {streak.current_streak || 0} Day Streak
        </div>
      )}
    </div>
  );
}
