/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobOpeningList } from "@/components/handson/job-opening-list";
import { JobApplicantList } from "@/components/handson/job-applicant-list";

import t from "@/app/lib/i18n";
export default function RecruitmentPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("erp.recruitment")}</h1>
        <p className="text-muted-foreground">
          {t("erp.manage_job_openings_and_track_candidates")}
        </p>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">{t("erp.job_openings")}</TabsTrigger>
          <TabsTrigger value="candidates">{t("erp.candidates")}</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <JobOpeningList />
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          <JobApplicantList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
