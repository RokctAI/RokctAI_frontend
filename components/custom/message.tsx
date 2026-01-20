"use client";

import { Attachment, ChatRequestOptions, CreateUIMessage as CreateMessage, UIMessage as Message, UIToolInvocation as ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode } from "react";

import { Markdown } from "./markdown";
import { BotIcon, UserIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import { AuthorizePayment } from "../flights/authorize-payment";
import { DisplayBoardingPass } from "../flights/boarding-pass";
import { CreateReservation } from "../flights/create-reservation";
import { FlightStatus } from "../flights/flight-status";
import { ListFlights } from "../flights/list-flights";
import { SelectSeats } from "../flights/select-seats";
import { VerifyPayment } from "../flights/verify-payment";
import { NoteCard } from "../notes/note-card";
import { ProjectOverview } from "../overviews/project-overview";
import { DealTask } from "../tasks/deal-task";
import { DisambiguateTask } from "../tasks/disambiguate-task";
import { PersonalTask } from "../tasks/personal-task";
import { ProjectTask } from "../tasks/project-task";
import { SetReminder } from "../tasks/set-reminder";
import { TaskStack } from "../tasks/task-stack";
import { ProjectCard } from "../projects/project-card";
import { LeaveApplication } from "../tasks/leave-application";
import { ResignationConfirmation } from "../tasks/resignation-confirmation";
import { AttendanceCard } from "../tasks/attendance-card";
import { ApprovalDashboard } from "../tasks/approval-dashboard";
import { AnnouncementCard } from "../tasks/announcement-card";
import { AnalyticsCard } from "../tasks/analytics-card";
import { CompetitorForm } from "../tasks/competitor-form";
import { HolidayWorkForm } from "../tasks/holiday-work-form";
import { LeadFormCard } from "../tasks/lead-form-card";
import { ProfileFormCard } from "../tasks/profile-form-card";

export const PreviewMessage = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
  append,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
  append?: (message: Message | CreateMessage, chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
}) => {
  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {content && typeof content === "string" && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{content}</Markdown>
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === "result") {
                const { result } = toolInvocation;

                return (
                  <div key={toolCallId}>
                    {toolName === "getWeather" ? (
                      <Weather weatherAtLocation={result} />
                    ) : toolName === "displayFlightStatus" ? (
                      <FlightStatus flightStatus={result} />
                    ) : toolName === "searchFlights" ? (
                      <ListFlights chatId={chatId} results={result} />
                    ) : toolName === "selectSeats" ? (
                      <SelectSeats chatId={chatId} availability={result} />
                    ) : toolName === "createReservation" ? (
                      Object.keys(result).includes("error") ? null : (
                        <CreateReservation reservation={result} />
                      )
                    ) : toolName === "authorizePayment" ? (
                      <AuthorizePayment intent={result} />
                    ) : toolName === "displayBoardingPass" ? (
                      <DisplayBoardingPass boardingPass={result} />
                    ) : toolName === "verifyPayment" ? (
                      <VerifyPayment result={result} />
                    ) : toolName === 'displayNote' ? (
                      <NoteCard note={result as any} />
                    ) : toolName === 'displayTaskStack' ? (
                      <TaskStack initialTasks={result.tasks as any} />
                    ) : toolName === 'displayProjectOverview' ? (
                      <ProjectOverview project={result as any} />
                    ) : toolName === 'disambiguate_task_type' ? (
                      <DisambiguateTask taskTitle={result.taskTitle} append={append as any} />
                    ) : toolName === 'display_task_with_reminders' ? (
                      <div className="flex flex-col gap-2">
                        <PersonalTask task={result.task} />
                        <SetReminder taskId={result.task.id} append={append as any} />
                      </div>
                    ) : toolName === 'displayProjectCard' ? (
                      <ProjectCard project={result as any} />
                    ) : toolName === 'display_leave_application' ? (
                      <LeaveApplication {...result} />
                    ) : toolName === 'initiate_resignation' ? (
                      <ResignationConfirmation />
                    ) : toolName === 'mark_attendance' && (result as any).requestLocation ? (
                      <AttendanceCard log_type={(result as any).log_type} />
                    ) : toolName === 'check_hr_dashboard' ? (
                      <ApprovalDashboard leaves={(result as any).leaves} expenses={(result as any).expenses} />
                    ) : toolName === 'check_announcements' ? (
                      <AnnouncementCard announcements={(result as any).announcements} />
                    ) : toolName === 'get_leave_analytics' ? (
                      <AnalyticsCard data={(result as any).data} title="Leave Trends by Department" />
                    ) : toolName === 'draft_competitor' ? (
                      <CompetitorForm name={(result as any).name} />
                    ) : toolName === 'manage_holiday_work' ? (
                      <HolidayWorkForm holidayName={(result as any).holidayName} holidayDate={(result as any).holidayDate} />
                    ) : toolName === 'lead_creation' ? (
                      <LeadFormCard initialData={result as any} />
                    ) : toolName === 'profile_update' ? (
                      <ProfileFormCard initialData={result as any} />
                    ) : (
                      <div>{JSON.stringify(result, null, 2)}</div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div key={toolCallId} className="skeleton">
                    {toolName === "getWeather" ? (
                      <Weather />
                    ) : toolName === "displayFlightStatus" ? (
                      <FlightStatus />
                    ) : toolName === "searchFlights" ? (
                      <ListFlights chatId={chatId} />
                    ) : toolName === "selectSeats" ? (
                      <SelectSeats chatId={chatId} />
                    ) : toolName === "createReservation" ? (
                      <CreateReservation />
                    ) : toolName === "authorizePayment" ? (
                      <AuthorizePayment />
                    ) : toolName === "displayBoardingPass" ? (
                      <DisplayBoardingPass />
                    ) : toolName === 'displayNote' ? (
                      <div className="h-24 w-full" /> // Placeholder skeleton
                    ) : toolName === 'displayTaskStack' ? (
                      <div className="h-48 w-full" /> // Placeholder skeleton
                    ) : toolName === 'displayProjectOverview' ? (
                      <div className="h-64 w-full" /> // Placeholder skeleton
                    ) : toolName === 'disambiguate_task_type' ? (
                      <div className="h-32 w-full" /> // Placeholder skeleton
                    ) : toolName === 'display_task_with_reminders' ? (
                      <div className="h-48 w-full" /> // Placeholder skeleton
                    ) : toolName === 'displayProjectCard' ? (
                      <div className="h-32 w-full" /> // Placeholder skeleton
                    ) : null}
                  </div>
                );
              }
            })}
          </div>
        )}

        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
