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

import {
  fetchUserInfo,
  fetchStreakInfo,
} from "@/app/actions/handson/all/lms/user/actions";
import { fetchMyCourses } from "@/app/actions/handson/all/lms/courses/actions";
import { fetchMyBatches } from "@/app/actions/handson/all/lms/batches/actions";
import {
  fetchMyLiveClasses,
  fetchUpcomingEvaluations,
} from "@/app/actions/handson/all/lms/events/actions";
import { DashboardHeader } from "./dashboard/header";
import { MyCourses } from "./dashboard/my-courses";
import { UpcomingEvents } from "./dashboard/upcoming-events";

export default async function LmsDashboardPage() {
  const [user, courses, batches, liveClasses, evals, streak] =
    await Promise.all([
      fetchUserInfo(),
      fetchMyCourses(),
      fetchMyBatches(),
      fetchMyLiveClasses(),
      fetchUpcomingEvaluations(),
      fetchStreakInfo(),
    ]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <DashboardHeader fullName={user?.full_name} streak={streak} />

      <MyCourses courses={courses} />

      <UpcomingEvents liveClasses={liveClasses} evals={evals} />
    </div>
  );
}
