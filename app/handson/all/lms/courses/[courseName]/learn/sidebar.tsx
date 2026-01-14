"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Circle, PlayCircle, FileText } from "lucide-react";

interface Lesson {
    name: string;
    title: string;
    icon?: string;
    is_complete?: boolean;
}

interface Chapter {
    title: string;
    lessons: Lesson[];
}

interface Course {
    name: string;
    title: string;
    chapters?: Chapter[];
}

interface SidebarProps {
    course: Course;
    className?: string;
}

export function LearningSidebar({ course, className }: SidebarProps) {
    const params = useParams();
    const pathname = usePathname();
    const currentLessonId = params.lessonId as string;

    // Helper to determine if a lesson is active
    const isActive = (lessonId: string) => currentLessonId === lessonId;

    return (
        <div className={cn("flex flex-col h-full border-r bg-muted/10", className)}>
            <div className="p-4 border-b bg-background">
                <Link
                    href={`/handson/all/lms/courses/${params.courseName}`}
                    className="text-sm font-medium hover:underline text-muted-foreground block mb-2"
                >
                    &larr; Back to Course Home
                </Link>
                <h2 className="font-semibold line-clamp-2 leading-tight">{course.title}</h2>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    {course.chapters?.map((chapter, index) => (
                        <div key={index} className="space-y-2">
                            <h3 className="font-semibold text-sm text-foreground/70 uppercase tracking-wider px-2">
                                {chapter.title}
                            </h3>
                            <div className="space-y-1">
                                {chapter.lessons.map((lesson) => (
                                    <Link
                                        key={lesson.name}
                                        href={`/handson/all/lms/courses/${params.courseName}/learn/${lesson.name}`}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                                            isActive(lesson.name)
                                                ? "bg-primary text-primary-foreground font-medium"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        {lesson.is_complete ? (
                                            <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                                        ) : isActive(lesson.name) ? (
                                            <PlayCircle className="h-4 w-4 shrink-0 text-primary-foreground" />
                                        ) : (
                                            <Circle className="h-4 w-4 shrink-0 opacity-40" />
                                        )}
                                        <span className="line-clamp-1">{lesson.title}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    {(!course.chapters || course.chapters.length === 0) && (
                        <div className="text-center py-10 text-muted-foreground text-sm">
                            <p>No content available.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
