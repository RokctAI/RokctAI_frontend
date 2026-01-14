import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MyCoursesProps {
    courses: any[];
}

export function MyCourses({ courses }: MyCoursesProps) {
    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    {courses.length > 0 ? "My Courses" : "Our Popular Courses"}
                </h2>
                <Link href="/handson/all/lms/courses" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                    See all <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course: any) => (
                        <Card key={course.name} className="hover:shadow-md transition-shadow">
                            <Link href={`/handson/all/lms/courses/${encodeURIComponent(course.name)}`}>
                                {course.image && (
                                    <div className="w-full h-32 overflow-hidden rounded-t-lg">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <CardHeader className="p-4">
                                    <CardTitle className="text-base line-clamp-1">{course.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 text-xs">{course.short_introduction}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 text-xs text-gray-500 flex justify-between">
                                    <span>{course.lesson_count || 0} Lessons</span>
                                    <span className="capitalize">{course.level || 'Beginner'}</span>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                    You are not enrolled in any courses yet.
                    <div className="mt-4">
                        <Button asChild>
                            <Link href="/handson/all/lms/courses">Browse Catalog</Link>
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
}
