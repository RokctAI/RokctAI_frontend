import { fetchUserInfo, fetchStreakInfo } from "@/app/actions/handson/all/lms/user/actions";
import { fetchMyCourses } from "@/app/actions/handson/all/lms/courses/actions";
import { fetchMyBatches } from "@/app/actions/handson/all/lms/batches/actions";
import { fetchMyLiveClasses, fetchUpcomingEvaluations } from "@/app/actions/handson/all/lms/events/actions";
import { DashboardHeader } from "./dashboard/header";
import { MyCourses } from "./dashboard/my-courses";
import { UpcomingEvents } from "./dashboard/upcoming-events";

export default async function LmsDashboardPage() {
    const [user, courses, batches, liveClasses, evals, streak] = await Promise.all([
        fetchUserInfo(),
        fetchMyCourses(),
        fetchMyBatches(),
        fetchMyLiveClasses(),
        fetchUpcomingEvaluations(),
        fetchStreakInfo()
    ]);

    return (
        <div className="container mx-auto py-8 px-4 space-y-8">
            <DashboardHeader
                fullName={user?.full_name}
                streak={streak}
            />

            <MyCourses
                courses={courses}
            />

            <UpcomingEvents
                liveClasses={liveClasses}
                evals={evals}
            />
        </div>
    );
}
