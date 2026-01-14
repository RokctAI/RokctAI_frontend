import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCourseByName } from "@/app/actions/handson/all/lms/courses/actions";
import { fetchUserInfo } from "@/app/actions/handson/all/lms/user/actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Reviews } from "./_components/reviews";

interface PageProps {
    params: {
        courseName: string;
    };
}

export default async function CourseDetailPage({ params }: PageProps) {
    const courseName = decodeURIComponent(params.courseName);
    const [course, userInfo] = await Promise.all([
        fetchCourseByName(courseName),
        fetchUserInfo()
    ]);

    if (!course) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="mb-8">
                <Link href="/handson/all/lms/courses" className="text-sm text-muted-foreground hover:underline mb-4 inline-block">
                    &larr; Back to Courses
                </Link>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {course.image && (
                        <div className="w-full md:w-1/3 rounded-lg overflow-hidden border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={course.image} alt={course.title} className="w-full h-auto object-cover" />
                        </div>
                    )}
                    <div className="flex-1 space-y-4">
                        <h1 className="text-4xl font-bold">{course.title}</h1>
                        <p className="text-xl text-gray-600">{course.short_introduction}</p>

                        <div className="flex items-center gap-4 mt-4">
                            <Button size="lg" className="px-8">
                                Start Learning
                            </Button>
                            {/* Add wishlist or share buttons here if needed */}
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="my-8" />

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">About this Course</h2>
                        <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: course.description }}></div>
                    </section>

                    {/* Instructors Section */}
                    {course.instructors && course.instructors.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Instructors</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {course.instructors.map((inst: any) => (
                                    <div key={inst.name} className="flex items-center gap-4 p-4 border rounded-lg">
                                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            {inst.image ? <img src={inst.image} alt={inst.full_name} /> : null}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{inst.full_name || inst.instructor_name}</div>
                                            <div className="text-sm text-muted-foreground">{inst.designation || 'Instructor'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <Separator />

                    {/* Reviews Section */}
                    <Reviews courseName={courseName} currentUser={userInfo?.email || ""} />
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg border">
                        <h3 className="font-semibold text-lg mb-4">Course Features</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between">
                                <span className="text-gray-600">Duration</span>
                                <span className="font-medium">{course.duration || 'Self-paced'}</span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-gray-600">Lectures</span>
                                <span className="font-medium">{course.lesson_count || 0}</span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-gray-600">Level</span>
                                <span className="font-medium text-capitalize">{course.level || 'All Levels'}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
