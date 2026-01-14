import Link from "next/link";
import { fetchCourses } from "@/app/actions/handson/all/lms/courses/actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function CoursesPage() {
    const courses = await fetchCourses();

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">All Courses</h1>

            {courses.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <p className="text-xl text-gray-500">No courses available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course: any) => (
                        <Card key={course.name} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
                            {course.image && (
                                <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="line-clamp-2">{course.title || course.name}</CardTitle>
                                <CardDescription className="line-clamp-3">
                                    {course.short_introduction || "No description available."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                {/* Metadata like tags or duration could go here */}
                                {course.tags && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {course.tags.slice(0, 3).map((tag: string) => (
                                            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="mt-auto pt-4 border-t">
                                <Button asChild className="w-full">
                                    <Link href={`/handson/all/lms/courses/${encodeURIComponent(course.name)}`}>
                                        View Course
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
