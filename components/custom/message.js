"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewMessage = void 0;
var framer_motion_1 = require("framer-motion");
var markdown_1 = require("./markdown");
var icons_1 = require("./icons");
var preview_attachment_1 = require("./preview-attachment");
var weather_1 = require("./weather");
var authorize_payment_1 = require("../flights/authorize-payment");
var boarding_pass_1 = require("../flights/boarding-pass");
var create_reservation_1 = require("../flights/create-reservation");
var flight_status_1 = require("../flights/flight-status");
var list_flights_1 = require("../flights/list-flights");
var select_seats_1 = require("../flights/select-seats");
var verify_payment_1 = require("../flights/verify-payment");
var note_card_1 = require("../notes/note-card");
var project_overview_1 = require("../overviews/project-overview");
var disambiguate_task_1 = require("../tasks/disambiguate-task");
var personal_task_1 = require("../tasks/personal-task");
var set_reminder_1 = require("../tasks/set-reminder");
var task_stack_1 = require("../tasks/task-stack");
var project_card_1 = require("../projects/project-card");
var leave_application_1 = require("../tasks/leave-application");
var resignation_confirmation_1 = require("../tasks/resignation-confirmation");
var attendance_card_1 = require("../tasks/attendance-card");
var approval_dashboard_1 = require("../tasks/approval-dashboard");
var announcement_card_1 = require("../tasks/announcement-card");
var analytics_card_1 = require("../tasks/analytics-card");
var competitor_form_1 = require("../tasks/competitor-form");
var holiday_work_form_1 = require("../tasks/holiday-work-form");
var lead_form_card_1 = require("../tasks/lead-form-card");
var profile_form_card_1 = require("../tasks/profile-form-card");
var PreviewMessage = function (_a) {
    var chatId = _a.chatId, role = _a.role, content = _a.content, toolInvocations = _a.toolInvocations, attachments = _a.attachments, append = _a.append;
    return (<framer_motion_1.motion.div className={"flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20"} initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <div className="size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500">
        {role === "assistant" ? <icons_1.BotIcon /> : <icons_1.UserIcon />}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {content && typeof content === "string" && (<div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <markdown_1.Markdown>{content}</markdown_1.Markdown>
          </div>)}

        {toolInvocations && (<div className="flex flex-col gap-4">
            {toolInvocations.map(function (toolInvocation) {
                var toolName = toolInvocation.toolName, toolCallId = toolInvocation.toolCallId, state = toolInvocation.state;
                if (state === "result") {
                    var result = toolInvocation.result;
                    return (<div key={toolCallId}>
                    {toolName === "getWeather" ? (<weather_1.Weather weatherAtLocation={result}/>) : toolName === "displayFlightStatus" ? (<flight_status_1.FlightStatus flightStatus={result}/>) : toolName === "searchFlights" ? (<list_flights_1.ListFlights chatId={chatId} results={result}/>) : toolName === "selectSeats" ? (<select_seats_1.SelectSeats chatId={chatId} availability={result}/>) : toolName === "createReservation" ? (Object.keys(result).includes("error") ? null : (<create_reservation_1.CreateReservation reservation={result}/>)) : toolName === "authorizePayment" ? (<authorize_payment_1.AuthorizePayment intent={result}/>) : toolName === "displayBoardingPass" ? (<boarding_pass_1.DisplayBoardingPass boardingPass={result}/>) : toolName === "verifyPayment" ? (<verify_payment_1.VerifyPayment result={result}/>) : toolName === 'displayNote' ? (<note_card_1.NoteCard note={result}/>) : toolName === 'displayTaskStack' ? (<task_stack_1.TaskStack initialTasks={result.tasks}/>) : toolName === 'displayProjectOverview' ? (<project_overview_1.ProjectOverview project={result}/>) : toolName === 'disambiguate_task_type' ? (<disambiguate_task_1.DisambiguateTask taskTitle={result.taskTitle} append={append}/>) : toolName === 'display_task_with_reminders' ? (<div className="flex flex-col gap-2">
                        <personal_task_1.PersonalTask task={result.task}/>
                        <set_reminder_1.SetReminder taskId={result.task.id} append={append}/>
                      </div>) : toolName === 'displayProjectCard' ? (<project_card_1.ProjectCard project={result}/>) : toolName === 'display_leave_application' ? (<leave_application_1.LeaveApplication {...result}/>) : toolName === 'initiate_resignation' ? (<resignation_confirmation_1.ResignationConfirmation />) : toolName === 'mark_attendance' && result.requestLocation ? (<attendance_card_1.AttendanceCard log_type={result.log_type}/>) : toolName === 'check_hr_dashboard' ? (<approval_dashboard_1.ApprovalDashboard leaves={result.leaves} expenses={result.expenses}/>) : toolName === 'check_announcements' ? (<announcement_card_1.AnnouncementCard announcements={result.announcements}/>) : toolName === 'get_leave_analytics' ? (<analytics_card_1.AnalyticsCard data={result.data} title="Leave Trends by Department"/>) : toolName === 'draft_competitor' ? (<competitor_form_1.CompetitorForm name={result.name}/>) : toolName === 'manage_holiday_work' ? (<holiday_work_form_1.HolidayWorkForm holidayName={result.holidayName} holidayDate={result.holidayDate}/>) : toolName === 'lead_creation' ? (<lead_form_card_1.LeadFormCard initialData={result}/>) : toolName === 'profile_update' ? (<profile_form_card_1.ProfileFormCard initialData={result}/>) : (<div>{JSON.stringify(result, null, 2)}</div>)}
                  </div>);
                }
                else {
                    return (<div key={toolCallId} className="skeleton">
                    {toolName === "getWeather" ? (<weather_1.Weather />) : toolName === "displayFlightStatus" ? (<flight_status_1.FlightStatus />) : toolName === "searchFlights" ? (<list_flights_1.ListFlights chatId={chatId}/>) : toolName === "selectSeats" ? (<select_seats_1.SelectSeats chatId={chatId}/>) : toolName === "createReservation" ? (<create_reservation_1.CreateReservation />) : toolName === "authorizePayment" ? (<authorize_payment_1.AuthorizePayment />) : toolName === "displayBoardingPass" ? (<boarding_pass_1.DisplayBoardingPass />) : toolName === 'displayNote' ? (<div className="h-24 w-full"/> // Placeholder skeleton
                        ) : toolName === 'displayTaskStack' ? (<div className="h-48 w-full"/> // Placeholder skeleton
                        ) : toolName === 'displayProjectOverview' ? (<div className="h-64 w-full"/> // Placeholder skeleton
                        ) : toolName === 'disambiguate_task_type' ? (<div className="h-32 w-full"/> // Placeholder skeleton
                        ) : toolName === 'display_task_with_reminders' ? (<div className="h-48 w-full"/> // Placeholder skeleton
                        ) : toolName === 'displayProjectCard' ? (<div className="h-32 w-full"/> // Placeholder skeleton
                        ) : null}
                  </div>);
                }
            })}
          </div>)}

        {attachments && (<div className="flex flex-row gap-2">
            {attachments.map(function (attachment) { return (<preview_attachment_1.PreviewAttachment key={attachment.url} attachment={attachment}/>); })}
          </div>)}
      </div>
    </framer_motion_1.motion.div>);
};
exports.PreviewMessage = PreviewMessage;
