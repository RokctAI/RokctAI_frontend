import { convertToCoreMessages, streamText, tool } from "ai";
import { addDays, addWeeks, startOfTomorrow } from "date-fns";
import { z } from "zod";

import { getModel } from "@/ai";
import { AI_MODELS } from "@/ai/models";
import {
  generateReservationPrice,
  generateSampleFlightSearchResults,
  generateSampleFlightStatus,
  generateSampleSeatSelection,
} from "@/ai/flights/actions";
import { auth } from "@/app/(auth)/auth";
import {
  createReservation,
  deleteChatById,
  getChatById,
  getReservationById,
  saveChat,
  createPersonalTask,
  setPersonalTaskReminder,
} from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  const {
    id,
    messages,
    model,
  }: { id: string; messages: Array<any>; model: string } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  // Check if the user is on a paid plan
  const isPaidUser =
    !session?.user?.is_free_plan &&
    (session?.user?.status === "Active" || session?.user?.status === "Trialing");

  // Check if AI is allowed for this plan
  if (session?.user?.is_ai === 0) {
    return new Response("AI is not enabled for your subscription plan.", {
      status: 403,
    });
  }

  // Check Quota and Limits
  let usePro = false;
  let blockRequest = false;
  let seatExceeded = false;

  if (session?.user?.apiKey && session?.user?.apiSecret && session?.user?.isPaaS) {
    try {
      const usageRes = await fetch(`${process.env.ROKCT_BASE_URL}/api/method/rokct.rokct.tenant.api.get_token_usage`, {
        headers: {
          "Authorization": `token ${session.user.apiKey}:${session.user.apiSecret}`
        }
      });
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        const {
          daily_pro_remaining,
          daily_flash_remaining,
          is_pro_unlimited,
          is_flash_unlimited,
          seat_limit_exceeded
        } = usageData.message || {};

        seatExceeded = seat_limit_exceeded;

        if (model === AI_MODELS.PAID.id && isPaidUser && !seat_limit_exceeded) {
          // Check Pro Quota
          if (is_pro_unlimited || daily_pro_remaining > 0) {
            usePro = true;
          }
          // Else fall through to Flash check
        }

        // If not using Pro (or fallback), check Flash Quota
        if (!usePro) {
          if (!is_flash_unlimited && daily_flash_remaining <= 0) {
            blockRequest = true;
          }
        }
      }
    } catch (e) {
      console.error("Failed to check quota", e);
    }
  } else {
    // Non-PaaS / Dev environment fallback
    if (model === AI_MODELS.PAID.id && isPaidUser) usePro = true;
  }

  if (blockRequest) {
    return new Response("Daily Quota Exceeded. Hands-on mode enabled.", { status: 403 });
  }

  // Select Model
  let selectedModel;
  let modelNameForUsage = "flash";

  if (usePro) {
    selectedModel = getModel(AI_MODELS.PAID.id);
    modelNameForUsage = "pro";
  } else {
    selectedModel = getModel(AI_MODELS.FREE.id);
    modelNameForUsage = "flash";
  }

  // *** ONBOARDING MODE ***
  const isOnboarding = !(session.user as any).isOnboarded;

  let systemPrompt = `\n
        - You are a world-class project management assistant.
        - Your primary goal is to help users manage their tasks.
        - If a user asks to create a task and the intent is ambiguous (e.g., "remind me to call John"), call the \`disambiguate_task_type\` tool to ask for clarification.
        - If the user specifies the task type (e.g., "create a personal task to call John"), call the appropriate tool directly.
        - After a personal task is created, you must ask the user if they want to set a reminder by calling the \`display_task_with_reminders\` tool.
        - **Project Workflow**: 
          - After creating a project, asking the user "Do you want to invite team members?".
          - Once users are added (or if user declines), ask "Should I suggest some tasks for this project?".
          - ONLY suggest tasks if the user explicitly confirms (Yes). If No, stop.
        - **Staff Advance Policy**: 
          - Internal employees/staff ALWAYS use "Salary Advances" (Employee Advance) and NOT "Loans".
          - If a staff member asks for a "loan", inform them that the company provides "Salary Advances" and use the \`request_advance\` tool.
        - Keep your responses limited to a sentence.
        - DO NOT output lists.
        - After every tool call, pretend you're showing the result to the user and keep your response limited to a phrase.
        - Today's date is ${new Date().toLocaleDateString()}.
        '
      `;

  if (isOnboarding) {
    systemPrompt = `\n
      - You are the Onboarding Assistant for ROKCT. 
      - Your goal is to interview the user to build their "Plan on a Page" (Vision, Pillars, Objectives, KPIs).
      - Follow this conversational flow:
        1. Ask for their Long-term Vision ("Why").
        2. Ask for 2-3 Strategic Pillars ("What").
        3. For each pillar, determine Objectives ("How").
        4. For each objective, define measurable KPIs ("Proof").
      - After getting information at each step, call the \`save_onboarding_progress\` tool to save the draft.
      - Once the plan is complete and confirmed, call the \`complete_onboarding\` tool.
      - Be professional, encouraging, and concise.
      - Today's date is ${new Date().toLocaleDateString()}.
      `;
  }

  const result = await streamText({
    model: selectedModel,
    system: systemPrompt,
    messages: coreMessages,
    tools: {
      // *** ONBOARDING TOOLS ***
      save_onboarding_progress: {
        description: "Saves the partial or complete Strategic Plan during onboarding.",
        parameters: z.object({
          vision_title: z.string().optional(),
          vision_description: z.string().optional(),
          pillars: z.array(z.object({
            title: z.string(),
            description: z.string(),
            objectives: z.array(z.object({
              title: z.string(),
              description: z.string(),
              kpis: z.array(z.object({
                title: z.string(),
                description: z.string()
              }))
            }))
          })).optional()
        }),
        execute: async (planData) => {
          // Import strictly inside here to avoid circular deps if any
          const { saveOnboardingProgress } = await import("@/app/actions/ai/onboarding");
          return await saveOnboardingProgress(planData as any);
        },
      },
      complete_onboarding: {
        description: "Marks the onboarding interview as complete.",
        parameters: z.object({}),
        execute: async () => {
          const { completeOnboarding } = await import("@/app/actions/ai/onboarding");
          return await completeOnboarding();
        }
      },
      // *** STANDARD TOOLS (Available but AI prioritized for Onboarding) ***
      getWeather: {
        description: "Get the weather forecast. If a location is not provided, uses the user's saved location.",
        parameters: z.object({
          location: z.string().optional().describe("City name (e.g. 'Musina')"),
          date: z.string().optional().describe("Specific date to check (e.g. '2025-12-16')"),
        }),
        execute: async ({ location, date }) => {
          const session = await auth();
          // Lazy imports for persistence
          const { db } = await import("@/db");
          const { user } = await import("@/db/schema");
          const { eq } = await import("drizzle-orm");

          let targetLocation = location;

          // 1. Fallback to saved location
          if (!targetLocation && session?.user && (session.user as any).location) {
            targetLocation = (session.user as any).location;
          }

          if (!targetLocation) {
            return { error: "Please specify a location (e.g., 'Weather in Musina')." };
          }

          // Note: We use the raw targetLocation. The backend (WeatherAPI) handles fuzzy search.

          // 2. Determine API Endpoint (Tenant Proxy vs Control Direct)
          try {
            if (!session?.user?.apiKey || !session?.user?.apiSecret) {
              return { error: "You must be logged in to fetch weather." };
            }

            const baseUrl = (session.user as any).siteName
              ? ((session.user as any).siteName.startsWith('http') ? (session.user as any).siteName : `https://${(session.user as any).siteName}`)
              : process.env.ROKCT_BASE_URL;

            const isControl = baseUrl === process.env.ROKCT_BASE_URL;

            const apiMethod = isControl
              ? "rokct.rokct.weather.get_weather_data"
              : "rokct.rokct.tenant.api.get_weather";

            const res = await fetch(`${baseUrl}/api/method/${apiMethod}?location=${encodeURIComponent(targetLocation)}`, {
              method: "GET",
              headers: {
                "Authorization": `token ${session.user.apiKey}:${session.user.apiSecret}`,
                "Content-Type": "application/json"
              }
            });

            if (!res.ok) {
              const errText = await res.text();
              console.error("Weather API Failed:", res.status, errText);
              return { error: "Unable to fetch forecast from Service." };
            }

            const responseData = await res.json();
            const weatherData = responseData.message || responseData;

            // 2.5 Validation: Did we get the right country?
            if (weatherData.location) {
              const returnedCountry = weatherData.location.country || "";
              const returnedCity = weatherData.location.name || "";

              // Standardize for comparison
              const countryMap: { [key: string]: string } = {
                "South Africa": "ZA",
                "United States": "US",
                "United States of America": "US",
                "United Kingdom": "UK",
                "Great Britain": "UK",
                "Canada": "CA",
                "Australia": "AU",
                "New Zealand": "NZ",
                "India": "IN",
                "Germany": "DE",
                "France": "FR",
                "Italy": "IT",
                "Spain": "ES",
                "Brazil": "BR",
                "Russia": "RU",
                "China": "CN",
                "Japan": "JP"
              };

              let returnedCode = returnedCountry;
              if (countryMap[returnedCountry]) {
                returnedCode = countryMap[returnedCountry];
              }

              // Check if user input contained a country hint (e.g., "messina, za" or "messina, italy")
              if (targetLocation && targetLocation.includes(",")) {
                const parts = targetLocation.split(",");
                if (parts.length > 1) {
                  const userCountryHint = parts[parts.length - 1].trim().toLowerCase(); // "za"

                  // Compare hints
                  const isCodeMatch = returnedCode.toLowerCase() === userCountryHint;
                  const isNameMatch = returnedCountry.toLowerCase().includes(userCountryHint);

                  // If user explicitly asked for "za" and got "italy", warn them.
                  if (!isCodeMatch && !isNameMatch) {
                    return {
                      error: `I found '${returnedCity}, ${returnedCountry}' but you asked for '${userCountryHint.toUpperCase()}'. Please try a more specific location, like '${returnedCity}, ${returnedCountry}' or search for another city.`
                    };
                  }
                }
              }
            }

            // 3. Persist Resolved Name from Backend (if User provided a location)
            if (location && session?.user?.id && weatherData.location) {
              let resolvedName = weatherData.location.name;
              let countryInfo = weatherData.location.country;

              // Re-use map for persistence standardization
              const countryMap: { [key: string]: string } = {
                "South Africa": "ZA",
                "United States": "US",
                "United States of America": "US",
                "United Kingdom": "UK",
                "Great Britain": "UK",
                "Canada": "CA",
                "Australia": "AU",
                "New Zealand": "NZ",
                "India": "IN",
                "Germany": "DE",
                "France": "FR",
                "Italy": "IT",
                "Spain": "ES",
                "Brazil": "BR",
                "Russia": "RU",
                "China": "CN",
                "Japan": "JP"
              };

              if (countryInfo && countryMap[countryInfo]) {
                countryInfo = countryMap[countryInfo];
              }

              if (countryInfo) {
                resolvedName = `${resolvedName}, ${countryInfo}`;
              }

              // Update user pref with the CLEAN name from the provider
              await db.update(user).set({ location: resolvedName }).where(eq(user.id, session.user.id));
            }

            // 4. Adapt WeatherAPI (Backend) format to Open-Meteo (Frontend) format
            const adaptedData = {
              current: {
                time: weatherData.location?.localtime || new Date().toISOString(),
                temperature_2m: weatherData.current?.temp_c || 0,
                interval: 0
              },
              current_units: { temperature_2m: "°C", time: "iso8601", interval: "seconds" },
              hourly: {
                time: [],
                temperature_2m: []
              },
              hourly_units: { temperature_2m: "°C", time: "iso8601" },
              daily: {
                sunrise: [],
                sunset: [],
                time: []
              },
              daily_units: { time: "iso8601", sunrise: "iso8601", sunset: "iso8601" }
            };

            if (weatherData.forecast && weatherData.forecast.forecastday) {
              weatherData.forecast.forecastday.forEach((day: any) => {
                adaptedData.daily.time.push(day.date);
                adaptedData.daily.sunrise.push(day.astro?.sunrise);
                adaptedData.daily.sunset.push(day.astro?.sunset);

                if (day.hour) {
                  day.hour.forEach((h: any) => {
                    adaptedData.hourly.time.push(h.time);
                    adaptedData.hourly.temperature_2m.push(h.temp_c);
                  });
                }
              });
            }

            // 5. Apply Date Shift
            if (date && adaptedData.hourly.time.length > 0) {
              const targetDate = new Date(date);
              const noonIndex = adaptedData.hourly.time.findIndex((t: string) => {
                const d = new Date(t);
                return d.getDate() === targetDate.getDate() && d.getHours() === 12;
              });
              if (noonIndex !== -1) {
                adaptedData.current.time = adaptedData.hourly.time[noonIndex];
                adaptedData.current.temperature_2m = adaptedData.hourly.temperature_2m[noonIndex];
              }
            }

            return adaptedData;

          } catch (e) {
            console.error("Weather Backend Error:", e);
            return { error: "Failed to communicate with Weather Service." };
          }
        },
      },
      learnWeatherAlias: {
        description: "Teach the system that a specific city name actually refers to another name (e.g., 'Musina' means 'Messina'). Use this when the user corrects a wrong location.",
        parameters: z.object({
          original: z.string().describe("The name the user typed (e.g. 'Musina')"),
          corrected: z.string().describe("The correct name (e.g. 'Messina')"),
        }),
        execute: async ({ original, corrected }) => {
          const session = await auth();
          try {
            if (!session?.user?.apiKey || !session?.user?.apiSecret) {
              return { error: "Authentication required to learn alias." };
            }

            const baseUrl = (session.user as any).siteName
              ? ((session.user as any).siteName.startsWith('http') ? (session.user as any).siteName : `https://${(session.user as any).siteName}`)
              : process.env.ROKCT_BASE_URL;

            // Helper function to call backend
            const callMethod = async (method: string) => {
              return fetch(`${baseUrl}/api/method/${method}?original=${encodeURIComponent(original)}&corrected=${encodeURIComponent(corrected)}`, {
                method: "POST", // API usually accepts POST for actions, but GET works for whitelist if no side-effects. Here we write to cache.
                headers: {
                  "Authorization": `token ${session.user.apiKey}:${session.user.apiSecret}`,
                  "Content-Type": "application/json"
                }
              });
            };

            // Try Tenant Proxy or Control Direct? 
            // We should stick to the same Logic as getWeather.
            // Note: set_weather_alias is in weather.py which is in 'rokct.rokct.weather'.
            // Is it available via Tenant Proxy? 
            // Tenant Proxy 'api.py' handles specific whitelist. 
            // If we didn't whitelist 'set_weather_alias' in 'tenant/api.py', tenant users can't call it.
            // Strategy: Since this is an AI feature, we can just call the Direct Control Endpoint if we are secure, 
            // OR we just rely on standard whitelisting. 
            // 'rokct.rokct.weather.set_weather_alias' is whitelisted.

            // Determine Routing
            const isControl = baseUrl === process.env.ROKCT_BASE_URL;
            const apiMethod = isControl
              ? "rokct.rokct.weather.set_weather_alias" // Control: Direct
              : "rokct.rokct.tenant.api.set_weather_alias"; // Tenant: Proxy to Control (Global)

            const res = await callMethod(apiMethod);
            const data = await res.json();
            return { success: true, message: "Thanks! I've learned this correction for next time." };

          } catch (e) {
            console.error("Alias Learning Failed", e);
            return { error: "Failed to save alias." };
          }
        }
      },
      displayFlightStatus: {
        description: "Display the status of a flight",
        parameters: z.object({
          flightNumber: z.string().describe("Flight number"),
          date: z.string().describe("Date of the flight"),
        }),
        execute: async ({ flightNumber, date }) => {
          const flightStatus = await generateSampleFlightStatus({
            flightNumber,
            date,
          });

          return flightStatus;
        },
      },
      searchFlights: {
        description: "Search for flights based on the given parameters",
        parameters: z.object({
          origin: z.string().describe("Origin airport or city"),
          destination: z.string().describe("Destination airport or city"),
        }),
        execute: async ({ origin, destination }) => {
          const results = await generateSampleFlightSearchResults({
            origin,
            destination,
          });

          return results;
        },
      },
      createProject: {
        description: "Create a new Project. Use this when the user wants to start a new project/workspace to organize tasks.",
        parameters: z.object({
          name: z.string().describe("The name of the project"),
          description: z.string().optional().describe("A brief description of the project's goal"),
        }),
        execute: async ({ name, description }) => {
          // Lazy import the action
          const { createAiProject } = await import("@/app/actions/ai/create");

          // We infer modelId for billing from the current context if needed, but the action defaults to FREE if not passed.
          // Ideally we should pass the model being used by the chat.
          // For now, let's rely on the action's default or pass a placeholder.
          const result = await createAiProject({ name, description });

          if (result.success) {
            return { success: true, project: result.message, message: `Project '${name}' created successfully.` };
          } else {
            return { error: result.error };
          }
        }
      },

      createGoal: {
        description: "Create a new Performance Goal (KPI). Use this when the user wants to set a goal for themselves.",
        parameters: z.object({
          description: z.string().describe("Description of the goal"),
          start_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
          end_date: z.string().optional().describe("Target completion date (YYYY-MM-DD)"),
        }),
        execute: async ({ description, start_date, end_date }) => {
          const { createAiGoal } = await import("@/app/actions/ai/hr");
          const result = await createAiGoal({ description, start_date, end_date });
          if (result.success) {
            return { success: true, message: `Goal created: ${description}` };
          } else {
            return { error: result.error };
          }
        }
      },
      getMyGoals: {
        description: "Fetch the user's current performance goals.",
        parameters: z.object({}),
        execute: async () => {
          const { getAiGoals } = await import("@/app/actions/ai/hr");
          const result = await getAiGoals();
          if (result.success) {
            return { goals: result.goals };
          } else {
            return { error: result.error };
          }
        }
      },
      createTask: {
        description: "Create a new Task. Can be linked to a project.",
        parameters: z.object({
          name: z.string().describe("The name/subject of the task"),
          priority: z.enum(['Low', 'Medium', 'High']).optional().describe("Priority level"),
          end_date: z.string().optional().describe("Due date (YYYY-MM-DD)"),
          project: z.string().optional().describe("The name or ID of the project to link this task to"),
        }),
        execute: async ({ name, priority, end_date, project }) => {
          const { createAiTask } = await import("@/app/actions/ai/create");
          const result = await createAiTask({ name, priority, end_date, project });

          if (result.success) {
            return { success: true, task: result.message, message: `Task '${name}' created.` };
          } else {
            return { error: result.error };
          }
        }
      },
      selectSeats: {
        description: "Select seats for a flight",
        parameters: z.object({
          flightNumber: z.string().describe("Flight number"),
        }),
        execute: async ({ flightNumber }) => {
          const seats = await generateSampleSeatSelection({ flightNumber });
          return seats;
        },
      },
      display_leave_application: {
        description: "Display an interactive Leave Application form for the user to pick dates.",
        parameters: z.object({
          leave_type: z.string().optional(),
          from_date: z.string().optional(),
          to_date: z.string().optional(),
          reason: z.string().optional()
        }),
        execute: async (props) => {
          // This returns the props to the frontend to render <LeaveApplication />
          // Logic handled in client-side ToolInvocation
          return props;
        }
      },
      applyLeave: {
        description: "Apply for leave directly via API (if dates are known).",
        parameters: z.object({
          leave_type: z.enum(['Sick Leave', 'Casual Leave', 'Privilege Leave', 'Leave Without Pay']).describe("Type of leave"),
          from_date: z.string().describe("Start date (YYYY-MM-DD)"),
          to_date: z.string().describe("End date (YYYY-MM-DD)"),
          reason: z.string().optional().describe("Reason for leave"),
        }),
        execute: async ({ leave_type, from_date, to_date, reason }) => {
          const { applyAiLeave } = await import("@/app/actions/ai/hr");
          const result = await applyAiLeave({ leave_type, from_date, to_date, reason });
          if (result.success) {
            return { success: true, message: `Leave application submitted for ${from_date} to ${to_date}.` };
          } else {
            return { error: result.error };
          }
        }
      },
      checkLeaveBalance: {
        description: "Check remaining leave balance.",
        parameters: z.object({}),
        execute: async () => {
          const { getLeaveBalance } = await import("@/app/actions/ai/hr");
          const result = await getLeaveBalance();
          if (result.success) {
            return { balances: result.balances };
          } else {
            return { error: result.error };
          }
        }
      },
      initiate_resignation: {
        description: "Initiate the employee resignation process (quitting the job). Handles confirmation UI.",
        parameters: z.object({}),
        execute: async () => {
          // Just trigger the UI
          return { pendingConfirmation: true };
        }
      },
      createExpense: {
        description: "Draft an expense claim. If user provides a receipt/image, the text content of the message will contain the URL.",
        parameters: z.object({
          description: z.string().describe("Description of the expense"),
          amount: z.number().describe("Amount spent"),
          attachment_url: z.string().optional().describe("URL of the receipt image if attached"),
        }),
        execute: async ({ description, amount, attachment_url }) => {
          const { createAiExpenseClaim } = await import("@/app/actions/ai/hr");
          const result = await createAiExpenseClaim({ description, amount, attachment_url });
          if (result.success) {
            return { success: true, message: result.message };
          } else {
            return { error: result.error };
          }
        }
      },
      getMyExpenses: {
        description: "Check status of recent expense claims.",
        parameters: z.object({}),
        execute: async () => {
          const { getAiExpenses } = await import("@/app/actions/ai/hr");
          const result = await getAiExpenses();
          if (result.success) {
            return { claims: result.claims };
          } else {
            return { error: result.error };
          }
        }
      },
      // --- HRMS PERSONAL TOOLS ---
      update_my_profile: tool({
        description: "Update your professional profile with bank-level details (ID, Bank, Tax).",
        parameters: z.object({
          first_name: z.string().optional().describe("Update legal first name"),
          last_name: z.string().optional().describe("Update legal last name"),
          id_number: z.string().optional().describe("Update 13-digit SA ID Number"),
          bank_name: z.string().optional().describe("Update bank name"),
          bank_account_no: z.string().optional().describe("Update bank account number"),
          bank_branch_code: z.string().optional().describe("Update bank branch code"),
          tax_id: z.string().optional().describe("Update Tax ID (SARS)")
        }),
        execute: async (data) => {
          const { updateAiMyProfile } = await import("@/app/actions/ai/hr");
          return await updateAiMyProfile(data);
        }
      }),
      mark_attendance: {
        description: "Mark attendance (Check-in/Check-out). Always triggers UI for Geolocation.",
        parameters: z.object({
          log_type: z.enum(['IN', 'OUT']).optional().describe("Override log type (IN/OUT). Defaults to toggling status.")
        }),
        execute: async ({ log_type }) => {
          // Return trigger for UI Card to handle Geolocation
          return { requestLocation: true, log_type };
        }
      },
      access_payroll: {
        description: "Retrieve recent salary slips/payslips.",
        parameters: z.object({}),
        execute: async () => {
          const { getAiPayslips } = await import("@/app/actions/ai/hr");
          const result = await getAiPayslips();
          if (result.success) {
            return { payslips: result.payslips };
          } else {
            return { error: result.error };
          }
        }
      },
      request_asset: tool({
        description: "Request an asset (e.g. laptop, phone) for work.",
        parameters: z.object({
          itemName: z.string().describe("The name of the item to request (e.g. 'Macbook Pro', 'iPhone 15')"),
          reason: z.string().describe("The reason for the request")
        }),
        execute: async ({ itemName, reason }) => {
          const { createAssetRequest } = await import("@/app/actions/ai/hr");
          return await createAssetRequest({ item_name: itemName, reason, modelId: model.modelId });
        }
      }),
      request_advance: tool({
        description: "Request a salary advance (Internal Staff/Employees ONLY).",
        parameters: z.object({
          amount: z.number().describe("The amount requested"),
          purpose: z.string().describe("Reason for the advance (e.g. Medical emergency)")
        }),
        execute: async ({ amount, purpose }) => {
          const { createAiEmployeeAdvance } = await import("@/app/actions/ai/hr");
          return await createAiEmployeeAdvance({ amount, purpose, modelId: model.modelId });
        }
      }),
      verify_hr_role: {
        description: "Check if the user has HR Manager privileges.",
        parameters: z.object({}),
        execute: async () => {
          const { checkHrRole } = await import("@/app/actions/ai/hr");
          return await checkHrRole();
        }
      },
      getPendingApprovals: {
        description: "Get a list of pending approval requests.",
        parameters: z.object({}),
        execute: async () => {
          const { verifyHrRole } = await import("@/app/lib/roles");
          const isAllowed = await verifyHrRole();
          if (!isAllowed) return "You are not authorized to manage Approvals.";

          const { getPendingApprovals } = await import("@/app/actions/ai/hr");
          return await getPendingApprovals();
        }
      },
      check_announcements: {
        description: "Fetch latest system announcements.",
        parameters: z.object({}),
        execute: async () => {
          const { getAnnouncements } = await import("@/app/actions/ai/hr");
          return await getAnnouncements();
        }
      },
      getLeaveStats: {
        description: "Get leave statistics dashboard.",
        parameters: z.object({}),
        execute: async () => {
          const { verifyHrRole } = await import("@/app/lib/roles");
          const isAllowed = await verifyHrRole();
          if (!isAllowed) return "You are not authorized to view Leave Statistics.";

          const { getLeaveStats } = await import("@/app/actions/ai/hr");
          return await getLeaveStats();
        }
      },
      approve_request: tool({
        description: "Approve a pending request (Leave, Expense, Material Request).",
        parameters: z.object({
          doctype: z.enum(["Leave Application", "Expense Claim", "Material Request"]).describe("Type of document"),
          name: z.string().describe("ID of the document (e.g., HR-LAP-2024-001)"),
          comment: z.string().optional().describe("Optional approval comment")
        }),
        execute: async ({ doctype, name, comment }) => {
          const { processApproval } = await import("@/app/actions/ai/hr");
          return await processApproval({ doctype, name, action: "Approve", comment, modelId: model.modelId });
        }
      }),
      reject_request: tool({
        description: "Reject a pending request.",
        parameters: z.object({
          doctype: z.enum(["Leave Application", "Expense Claim", "Material Request"]).describe("Type of document"),
          name: z.string().describe("ID of the document"),
          comment: z.string().optional().describe("Reason for rejection")
        }),
        execute: async ({ doctype, name, comment }) => {
          const { processApproval } = await import("@/app/actions/ai/hr");
          return await processApproval({ doctype, name, action: "Reject", comment, modelId: model.modelId });
        }
      }),
      createReservation: {
        description: "Display pending reservation details",
        parameters: z.object({
          seats: z.string().array().describe("Array of selected seat numbers"),
          flightNumber: z.string().describe("Flight number"),
          departure: z.object({
            cityName: z.string().describe("Name of the departure city"),
            airportCode: z.string().describe("Code of the departure airport"),
            timestamp: z.string().describe("ISO 8601 date of departure"),
            gate: z.string().describe("Departure gate"),
            terminal: z.string().describe("Departure terminal"),
          }),
          arrival: z.object({
            cityName: z.string().describe("Name of the arrival city"),
            airportCode: z.string().describe("Code of the arrival airport"),
            timestamp: z.string().describe("ISO 8601 date of arrival"),
            gate: z.string().describe("Arrival gate"),
            terminal: z.string().describe("Arrival terminal"),
          }),
          passengerName: z.string().describe("Name of the passenger"),
        }),
        execute: async (props) => {
          const { totalPriceInUSD } = await generateReservationPrice(props);
          const session = await auth();

          const id = generateUUID();

          if (session && session.user && session.user.id) {
            await createReservation({
              id,
              userId: session.user.id,
              details: { ...props, totalPriceInUSD },
            });

            return { id, ...props, totalPriceInUSD };
          } else {
            return {
              error: "User is not signed in to perform this action!",
            };
          }
        },
      },
      authorizePayment: {
        description:
          "User will enter credentials to authorize payment, wait for user to repond when they are done",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
        }),
        execute: async ({ reservationId }) => {
          return { reservationId };
        },
      },
      verifyPayment: {
        description: "Verify payment status",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
        }),
        execute: async ({ reservationId }) => {
          const reservation = await getReservationById({ id: reservationId });

          if (reservation.hasCompletedPayment) {
            return { hasCompletedPayment: true };
          } else {
            return { hasCompletedPayment: false };
          }
        },
      },
      displayBoardingPass: {
        description: "Display a boarding pass",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
          passengerName: z
            .string()
            .describe("Name of the passenger, in title case"),
          flightNumber: z.string().describe("Flight number"),
          seat: z.string().describe("Seat number"),
          departure: z.object({
            cityName: z.string().describe("Name of the departure city"),
            airportCode: z.string().describe("Code of the departure airport"),
            airportName: z.string().describe("Name of the departure airport"),
            timestamp: z.string().describe("ISO 8601 date of departure"),
            terminal: z.string().describe("Departure terminal"),
            gate: z.string().describe("Departure gate"),
          }),
          arrival: z.object({
            cityName: z.string().describe("Name of the arrival city"),
            airportCode: z.string().describe("Code of the arrival airport"),
            airportName: z.string().describe("Name of the arrival airport"),
            timestamp: z.string().describe("ISO 8601 date of arrival"),
            terminal: z.string().describe("Arrival terminal"),
            gate: z.string().describe("Arrival gate"),
          }),
        }),
        execute: async (boardingPass) => {
          return boardingPass;
        },
      },
      // --- COMPETITOR TOOLS ---
      draft_competitor: tool({
        description: "Draft a new competitor entry with a name.",
        parameters: z.object({
          name: z.string().describe("The name of the competitor to draft"),
        }),
        execute: async ({ name }) => {
          const { verifyCrmRole } = await import("@/app/lib/roles");
          const isAllowed = await verifyCrmRole();
          if (!isAllowed) return "You are not authorized to manage Competitors.";
          return { name };
        },
      }),

      get_competitors: tool({
        description: "Get a list of all competitors.",
        parameters: z.object({}),
        execute: async () => {
          const { verifyCrmRole } = await import("@/app/lib/roles");
          const isAllowed = await verifyCrmRole();
          if (!isAllowed) return "You are not authorized to view Competitors.";

          const { getAiCompetitors } = await import("@/app/actions/ai/competitor");
          return await getAiCompetitors();
        },
      }),

      analyze_competitor: tool({
        description: "Analyze a specific competitor's strengths and weaknesses using AI.",
        parameters: z.object({
          name: z.string().describe("The name of the competitor to analyze"),
        }),
        execute: async ({ name }) => {
          const { verifyCrmRole } = await import("@/app/lib/roles");
          const isAllowed = await verifyCrmRole();
          if (!isAllowed) return "You are not authorized to analyze Competitors.";

          const { analyzeAiCompetitor } = await import("@/app/actions/ai/competitor");
          return await analyzeAiCompetitor({ name });
        },
      }),
      // --- CRM TOOLS ---
      get_my_leads: tool({
        description: "Fetch a list of active CRM leads you are currently managing.",
        parameters: z.object({}),
        execute: async () => {
          const { getMyLeads } = await import("@/app/actions/ai/crm");
          return await getMyLeads();
        }
      }),
      create_lead: tool({
        description: "Create a new CRM lead with bank-level KYC fields.",
        parameters: z.object({
          lead_name: z.string().describe("The name of the lead (First Name or Full Name)"),
          organization: z.string().optional().describe("Associated company or organization"),
          email_id: z.string().email().optional().describe("Email address"),
          mobile_no: z.string().optional().describe("Mobile phone number"),
          id_number: z.string().optional().describe("13-digit South African ID Number")
        }),
        execute: async (data) => {
          const { createAiLead } = await import("@/app/actions/ai/crm");
          return await createAiLead(data);
        }
      }),
      update_lead: tool({
        description: "Update an existing lead's KYC status or ID number.",
        parameters: z.object({
          name: z.string().describe("The Lead ID (e.g., CRM-LEAD-2024-001)"),
          kyc_status: z.enum(["Pending", "Verified", "Rejected"]).optional().describe("New KYC status"),
          id_number: z.string().optional().describe("Update the ID number")
        }),
        execute: async (data) => {
          const { updateAiLead } = await import("@/app/actions/ai/crm");
          return await updateAiLead(data);
        }
      }),
      displayTaskStack: {
        description: "Displays a stack of tasks.",
        parameters: z.object({
          tasks: z.array(z.union([
            z.object({
              type: z.literal('project'),
              data: z.object({
                id: z.number(),
                name: z.string(),
                priority: z.enum(['critical', 'high', 'medium', 'low']),
                end_date: z.string(),
                assignees: z.array(z.object({ id: z.number(), name: z.string(), avatar: z.string().url() })),
              }),
            }),
            z.object({
              type: z.literal('deal'),
              data: z.object({
                id: z.number(),
                name: z.string(),
                priority: z.enum(['High', 'Medium', 'Low']),
                date: z.string(),
                time: z.string(),
              }),
            }),
          ]))
        }),
        execute: async ({ tasks }) => {
          // In a real app, you'd fetch data here. For now, we just return the props.
          return { tasks };
        },
      },
      displayNote: {
        description: "Displays a note card.",
        parameters: z.object({
          id: z.number().describe("The ID of the note."),
          title: z.string().describe("The title of the note."),
          text: z.string().describe("The content of the note."),
          color: z.enum(['yellow', 'blue', 'green', 'red', 'purple', 'pink', 'gray']).describe("The color of the note."),
        }),
        execute: async (note) => {
          // In a real app, you'd fetch data here. For now, we just return the props.
          return note;
        },
      },
      displayProjectOverview: {
        description: "Displays a project overview card.",
        parameters: z.object({
          id: z.number().describe("The ID of the project."),
          project_name: z.string().describe("The name of the project."),
          status: z.enum(['in_progress', 'on_hold', 'complete', 'canceled']).describe("The status of the project."),
          budget: z.number().describe("The project budget."),
          progress: z.number().describe("The project completion percentage."),
          users: z.array(z.object({ id: z.number(), name: z.string(), avatar: z.string().url() })).describe("Users assigned to the project."),
          task_count: z.number().describe("The total number of tasks in the project."),
        }),
        execute: async (project) => {
          // In a real app, you'd fetch data here. For now, we just return the props.
          return project;
        },
      },
      disambiguate_task_type: {
        description: "Asks the user to clarify which type of task they want to create.",
        parameters: z.object({
          taskTitle: z.string().describe("The original title of the task the user wanted to create."),
        }),
        execute: async ({ taskTitle }) => {
          return { taskTitle };
        },
      },
      create_personal_task: {
        description: "Creates a new personal task for the user.",
        parameters: z.object({
          title: z.string().describe("The title of the task."),
          description: z.string().optional().describe("The description of the task."),
        }),
        execute: async ({ title, description }) => {
          const session = await auth();
          if (!session?.user?.id) {
            return { error: "User not authenticated." };
          }
          const task = await createPersonalTask({ userId: session.user.id, title, description });
          return task;
        },
      },
      display_task_with_reminders: {
        description: "Displays a created task card along with reminder options.",
        parameters: z.object({
          task: z.any().describe("The task object that was just created."),
        }),
        execute: async ({ task }) => {
          return { task };
        },
      },
      set_reminder_date: {
        description: "Sets a reminder for a specific task.",
        parameters: z.object({
          taskId: z.string().describe("The ID of the task to set a reminder for."),
          when: z.enum(['Today', 'Tomorrow', 'Next Week']).describe("When to set the reminder."),
        }),
        execute: async ({ taskId, when }) => {
          let reminderAt: Date;
          const now = new Date();
          if (when === 'Today') {
            reminderAt = now; // Or a specific time today, e.g., end of day
          } else if (when === 'Tomorrow') {
            reminderAt = startOfTomorrow();
          } else { // Next Week
            reminderAt = addWeeks(now, 1);
          }
          await setPersonalTaskReminder({ taskId, reminderAt });
          return { success: true, reminderSetAt: reminderAt.toISOString() };
        },
      },

      // *** SUPPLY CHAIN TOOLS ***
      check_stock: tool({
        description: "Check current stock levels for an item.",
        parameters: z.object({
          itemQuery: z.string().describe("The item name or code to check stock for"),
        }),
        execute: async ({ itemQuery }) => {
          const { verifySupplyChainRole } = await import("@/app/lib/roles");
          const isAllowed = await verifySupplyChainRole();
          if (!isAllowed) return "You are not authorized to view Stock.";

          const { checkStock } = await import("@/app/actions/ai/supply_chain");
          return await checkStock({ itemQuery });
        },
      }),

      create_purchase_order: tool({
        description: "Create a purchase order for a supplier.",
        parameters: z.object({
          supplier: z.string().describe("The name of the supplier"),
          items: z.array(z.object({
            item: z.string().describe("Item name or code"),
            qty: z.number().describe("Quantity to order")
          })).describe("List of items to order")
        }),
        execute: async ({ supplier, items }) => {
          const { verifySupplyChainRole } = await import("@/app/lib/roles");
          const isAllowed = await verifySupplyChainRole();
          if (!isAllowed) return "You are not authorized to create Purchase Orders.";

          const { createAiPurchaseOrder } = await import("@/app/actions/ai/supply_chain");
          return await createAiPurchaseOrder({ supplier, items });
        },
      }),

      create_stock_entry: tool({
        description: "Create a stock transfer or entry.",
        parameters: z.object({
          source_warehouse: z.string().describe("Source Warehouse"),
          target_warehouse: z.string().describe("Target Warehouse"),
          items: z.array(z.object({
            item: z.string().describe("Item name"),
            qty: z.number().describe("Quantity")
          }))
        }),
        execute: async ({ source_warehouse, target_warehouse, items }) => {
          const { verifySupplyChainRole } = await import("@/app/lib/roles");
          const isAllowed = await verifySupplyChainRole();
          if (!isAllowed) return "You are not authorized to manage Stock Entries.";

          const { createAiStockEntry } = await import("@/app/actions/ai/supply_chain");
          return await createAiStockEntry({ source_warehouse, target_warehouse, items });
        },
      }),

      smart_status_update: tool({
        description: "Smartly update document status or trigger next workflow steps using fuzzy logic. Use this for 'Approve quote', 'Deliver order', 'Reject invoice', etc.",
        parameters: z.object({
          query: z.string().describe("The document identifier or customer name, e.g. 'Woolworth', 'Q-2024-001'"),
          status: z.enum(['Approved', 'Rejected', 'Delivered', 'Paid', 'Cancelled']).describe("The new status or action intent"),
          document_type: z.enum(['Quotation', 'Sales Order', 'Purchase Order', 'Invoice']).optional().describe("Explicit document type if known")
        }),
        execute: async ({ query, status, document_type }) => {
          const { updateSmartStatus } = await import("@/app/actions/ai/smart_status");
          return await updateSmartStatus({ query, status, document_type });
        }
      }),
      manage_holiday_work: tool({
        description: "Check for upcoming holidays and allow the manager to schedule work or announcements.",
        parameters: z.object({}),
        execute: async () => {
          const { checkUpcomingHoliday } = await import("@/app/actions/ai/holiday");
          const result = await checkUpcomingHoliday();
          if (result.found) {
            return {
              ui: "holiday_work_form",
              holidayName: result.holiday.description || "Holiday",
              holidayDate: result.holiday.holiday_date
            };
          }
          return "No upcoming holidays found.";
        }
      }),
    },
    onFinish: async ({ usage, responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });

          // Record token usage if PaaS login
          if (session.user.isPaaS && session.user.apiKey && session.user.apiSecret && usage) {
            await fetch(`${process.env.ROKCT_BASE_URL}/api/method/rokct.rokct.tenant.api.record_token_usage`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `token ${session.user.apiKey}:${session.user.apiSecret}`
              },
              body: JSON.stringify({
                tokens_used: usage.totalTokens,
                model_name: modelNameForUsage
              })
            });
          }

        } catch (error) {
          // Failed to save chat or record usage
          console.error("Background task failed", error);
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
