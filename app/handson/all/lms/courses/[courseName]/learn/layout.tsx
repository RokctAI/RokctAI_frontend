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

export default async function LearningLayout({ children, params }: LayoutProps) {
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
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
