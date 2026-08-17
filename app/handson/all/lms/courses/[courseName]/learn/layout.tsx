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

import { fetchCourseByName } from "@/app/actions/handson/all/lms/courses/actions";
import { notFound } from "next/navigation";
import { LearningSidebar } from "./sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  params: {
    courseName: string;
  };
}

export default async function LearningLayout({
  children,
  params,
}: LayoutProps) {
  const courseName = decodeURIComponent(params.courseName);
  const course = await fetchCourseByName(courseName);

  if (!course) {
    notFound();
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-80 lg:w-96 shrink-0 h-full">
        <LearningSidebar course={course} className="h-full" />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Menu Trigger (Sticky at top of content area on mobile) */}
        <div className="md:hidden p-4 border-b flex items-center gap-4 bg-background z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <LearningSidebar course={course} className="h-full border-none" />
            </SheetContent>
          </Sheet>
          <h1 className="font-semibold truncate">{course.title}</h1>
        </div>

        {/* Lesson Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
