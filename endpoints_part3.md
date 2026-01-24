# API Endpoints (Part 3 of 6)

| No. | App | Endpoint | Payload / Arguments | Path | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 303 | CONTROL-TENDER | `deleteGeneratedTenderTask` | `name: string` | `./app/actions/handson/control/tender/tender.ts` | Server Action |
| 304 | CONTROL-TENDER | `deleteIntelligentTaskSet` | `name: string` | `./app/actions/handson/control/tender/tender.ts` | Server Action |
| 305 | CONTROL-TENDER | `deleteTenderWorkflowTask` | `name: string` | `./app/actions/handson/control/tender/tender.ts` | Server Action |
| 306 | CONTROL-TENDER | `deleteTenderWorkflowTemplate` | `name: string` | `./app/actions/handson/control/tender/tender.ts` | Server Action |
| 307 | CONTROL-TENDER | `getGeneratedTenderTasks` | `` | `./app/actions/handson/control/tender/tender.ts` | Server Action |
| 308 | CONTROL-TENDER | `getIntelligentTaskSets` | `` | `./app/actions/handson/control/tender/tender.ts` | Server Action |
| 309 | CONTROL-TENDER | `getTenderControlSettings` | `` | `./app/actions/handson/control/tender/tender.ts` | Server Action |
| 310 | CONTROL-TENDER | `getTenderWorkflowTasks` | `` | `./app/actions/handson/control/tender/tender.ts` | Server Action |
| 311 | CONTROL-TENDER | `getTenderWorkflowTemplates` | `` | `./app/actions/handson/control/tender/tender.ts` | Server Action |
| 312 | CONTROL-TENDER | `updateGeneratedTenderTask` | `name: string, data: any` | `./app/actions/handson/control/tender/tender.ts` | Server Action |
| 313 | CONTROL-TENDER | `updateIntelligentTaskSet` | `name: string, data: any` | `./app/actions/handson/control/tender/tender.ts` | Server Action |
| 314 | CONTROL-TENDER | `updateTenderControlSettings` | `name: string, data: any` | `./app/actions/handson/control/tender/tender.ts` | Server Action |
| 315 | CONTROL-TENDER | `updateTenderWorkflowTask` | `name: string, data: any` | `./app/actions/handson/control/tender/tender.ts` | Server Action |
| 316 | CONTROL-TENDER | `updateTenderWorkflowTemplate` | `name: string, data: any` | `./app/actions/handson/control/tender/tender.ts` | Server Action |
| 317 | CONTROL-TERMS | `deleteMasterTerm` | `name: string` | `./app/actions/handson/control/terms/terms.ts` | Server Action |
| 318 | CONTROL-TERMS | `getMasterTerms` | `` | `./app/actions/handson/control/terms/terms.ts` | Server Action |
| 319 | CONTROL-TERMS | `saveMasterTerm` | `name: string \| undefined, title: string, terms: string` | `./app/actions/handson/control/terms/terms.ts` | Server Action |
| 320 | CONTROL-VOUCHERS.TS | `createVoucher` | `data: any` | `./app/actions/handson/control/vouchers.ts` | Server Action |
| 321 | CONTROL-VOUCHERS.TS | `deleteVoucher` | `name: string` | `./app/actions/handson/control/vouchers.ts` | Server Action |
| 322 | CONTROL-VOUCHERS.TS | `getVouchers` | `` | `./app/actions/handson/control/vouchers.ts` | Server Action |
| 323 | CONTROL-VOUCHERS.TS | `updateVoucher` | `name: string, data: any` | `./app/actions/handson/control/vouchers.ts` | Server Action |
| 324 | CONTROL-WORKFLOWS | `applyGlobalWorkflows` | `doctype: string, data: any` | `./app/actions/handson/control/workflows/workflows.ts` | Server Action |
| 325 | CONTROL-WORKFLOWS | `deleteGlobalWorkflow` | `name: string` | `./app/actions/handson/control/workflows/workflows.ts` | Server Action |
| 326 | CONTROL-WORKFLOWS | `getGlobalWorkflows` | `doctype?: string` | `./app/actions/handson/control/workflows/workflows.ts` | Fetches Global Workflow Rules. |
| 327 | CONTROL-WORKFLOWS | `saveGlobalWorkflow` | `rule: WorkflowRule` | `./app/actions/handson/control/workflows/workflows.ts` | Save a Global Workflow Rule. |
| 328 | CONTROL-WORKFLOWS | `seedWorkflows` | `` | `./app/actions/handson/control/workflows/workflows.ts` | Server Action |
| 329 | CORE | `fetchBrandingData` | `` | `./app/actions/branding.ts` | Server action to fetch branding data. This ensures database and header access stays on the server. |
| 330 | CORE | `generateReservationPrice` | `props: { seats: string[]; flightNumber: string; departure: { cityName: string; airportCode: string; timestamp: string; gate: string; terminal: string; }; arrival: { cityName: string; airportCode: string; timestamp: string; gate: string; terminal: string; }; passengerName: string; }` | `./ai/flights/actions.ts` | Server Action |
| 331 | CORE | `generateSampleFlightSearchResults` | `{ origin, destination, }: { origin: string; destination: string; }` | `./ai/flights/actions.ts` | Server Action |
| 332 | CORE | `generateSampleFlightStatus` | `{ flightNumber, date, }: { flightNumber: string; date: string; }` | `./ai/flights/actions.ts` | Server Action |
| 333 | CORE | `generateSampleSeatSelection` | `{ flightNumber, }: { flightNumber: string; }` | `./ai/flights/actions.ts` | Server Action |
| 334 | CORE | `getClientSubscriptions` | `` | `./app/actions/portal/client.ts` | Server Action |
| 335 | CORE | `getCurrentEmployeeId` | `` | `./app/lib/roles.ts` | Gets the Employee record name (ID) for the currently logged-in user. Returns null if not found. |
| 336 | CORE | `getGuestCountryCode` | `` | `./app/services/common/geoip.ts` | Detects the country data from the request IP address. Uses available headers (x-forwarded-for, etc.) or a fallback API if needed. Returns ISO 2-letter country code and full country name. |
| 337 | CORE | `getLendingLicenseDetails` | `` | `./app/lib/roles.ts` | Returns detailed license and compliance status, including basic company info for reports. |
| 338 | CORE | `getPricingMetadata` | `userCountry?: string` | `./lib/actions/getPricingMetadata.ts` | Server Action |
| 339 | CORE | `getSessionCompanyContext` | `` | `./app/actions/company.ts` | Server Action |
| 340 | CORE | `getSessionCurrency` | `` | `./app/actions/currency.ts` | Server Action |
| 341 | CORE | `getSubscriptionPlans` | `category?: string` | `./lib/actions/getSubscriptionPlans.ts` | Server Action |
| 342 | CORE | `verifyActiveEmployee` | `` | `./app/lib/roles.ts` | Checks if the current user is an Active employee (Not Resigning/Left). Returns TRUE if Active, FALSE if Resigning/Left. |
| 343 | CORE | `verifyCrmRole` | `` | `./app/lib/roles.ts` | Verifies if the current user has CRM/Sales Manager or System Manager role. Returns true if authorized, false otherwise. |
| 344 | CORE | `verifyFinanceRole` | `` | `./app/lib/roles.ts` | Verifies if the current user has Accounts Manager, Accounts User, or System Manager role. |
| 345 | CORE | `verifyHrRole` | `` | `./app/lib/roles.ts` | Verifies if the current user has HR Manager or System Manager role. Returns true if authorized, false otherwise. Usage: if (!await verifyHrRole()) return { success: false, error: "Unauthorized" }; |
| 346 | CORE | `verifyLendingLicense` | `` | `./app/lib/roles.ts` | Verifies if the user's company has a valid Lending License. Returns true if licensed, false otherwise. |
| 347 | CORE | `verifyLendingRole` | `` | `./app/lib/roles.ts` | Verifies if the current user has Lending Manager, Loan User, or System Manager role. COMBINES both Role Check AND License Check. |
| 348 | CORE | `verifyLmsRole` | `` | `./app/lib/roles.ts` | Verifies if the current user has LMS Student, Instructor, or System Manager role. |
| 349 | CORE | `verifySupplyChainRole` | `` | `./app/lib/roles.ts` | Verifies if the current user has Stock Manager, Purchase Manager, or System Manager role. |
| 350 | CORE | `verifySystemManager` | `` | `./app/lib/roles.ts` | Verifies if the current user is a System Manager. |
| 351 | CRM | `createCompetitor` | `data: any` | `./app/actions/handson/all/crm/competitor.ts` | Server Action |
| 352 | CRM | `createCompetitorRoute` | `data: any` | `./app/actions/handson/all/crm/competitor.ts` | Server Action |
| 353 | CRM | `createCompetitorZone` | `data: any` | `./app/actions/handson/all/crm/competitor.ts` | Server Action |
| 354 | CRM | `createContract` | `data: ContractData` | `./app/actions/handson/all/crm/contracts.ts` | Server Action |
| 355 | CRM | `createEmailCampaign` | `data: EmailCampaignData` | `./app/actions/handson/all/crm/campaigns.ts` | Server Action |
| 356 | CRM | `createGrievance` | `data: any` | `./app/actions/handson/all/crm/lifecycle.ts` | Server Action |
| 357 | CRM | `createIndustry` | `data: any` | `./app/actions/handson/all/crm/competitor.ts` | Server Action |
| 358 | CRM | `createIssue` | `data: IssueData` | `./app/actions/handson/all/crm/support/issue.ts` | Server Action |
| 359 | CRM | `createLead` | `data: LeadData` | `./app/actions/handson/all/crm/leads.ts` | Server Action |
| 360 | CRM | `createNote` | `data: any` | `./app/actions/handson/all/crm/support/note.ts` | Server Action |
| 361 | CRM | `createOpportunity` | `data: OpportunityData` | `./app/actions/handson/all/crm/deals.ts` | Creates a new Deal (Opportunity). |
| 362 | CRM | `createPolicy` | `data: any` | `./app/actions/handson/all/crm/lifecycle.ts` | Server Action |
| 363 | CRM | `createProspect` | `data: ProspectData` | `./app/actions/handson/all/crm/prospects.ts` | Creates a new Prospect. |
| 364 | CRM | `createServiceLevelAgreement` | `data: SLAData` | `./app/actions/handson/all/crm/support/sla.ts` | Server Action |
| 365 | CRM | `createSubscription` | `data: { party_type: string; party: string; plans: { plan: string; qty: number }[] }` | `./app/actions/handson/all/crm/subscriptions.ts` | Creates a Subscription. |
| 366 | CRM | `createSubscriptionPlan` | `data: { plan_name: string; currency: string; cost: number; billing_interval: "Month" \| "Year" }` | `./app/actions/handson/all/crm/subscriptions.ts` | Creates a Subscription Plan. |
| 367 | CRM | `createWarning` | `data: any` | `./app/actions/handson/all/crm/lifecycle.ts` | Server Action |
| 368 | CRM | `createWarrantyClaim` | `data: { customer: string; item_code: string; issue_date: string; description: string }` | `./app/actions/handson/all/crm/support/warranty.ts` | Server Action |
| 369 | CRM | `deleteCompetitor` | `name: string` | `./app/actions/handson/all/crm/competitor.ts` | Server Action |
| 370 | CRM | `deleteCompetitorRoute` | `name: string` | `./app/actions/handson/all/crm/competitor.ts` | Server Action |
| 371 | CRM | `deleteCompetitorZone` | `name: string` | `./app/actions/handson/all/crm/competitor.ts` | Server Action |
| 372 | CRM | `deleteLead` | `name: string` | `./app/actions/handson/all/crm/leads.ts` | Deletes a Lead. @param name - Lead ID |
| 373 | CRM | `deleteOpportunity` | `name: string` | `./app/actions/handson/all/crm/deals.ts` | Deletes a Deal (Opportunity). |
| 374 | CRM | `deleteProspect` | `name: string` | `./app/actions/handson/all/crm/prospects.ts` | Deletes a Prospect. |
| 375 | CRM | `getCallLogs` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/call_logs.ts` | Server Action |
| 376 | CRM | `getCompetitor` | `name: string` | `./app/actions/handson/all/crm/competitor.ts` | Server Action |
| 377 | CRM | `getCompetitorProducts` | `competitorName?: string` | `./app/actions/handson/all/crm/competitor.ts` | Server Action |
| 378 | CRM | `getCompetitorRoutes` | `` | `./app/actions/handson/all/crm/competitor.ts` | Server Action |
| 379 | CRM | `getCompetitorZones` | `` | `./app/actions/handson/all/crm/competitor.ts` | Server Action |
| 380 | CRM | `getCompetitors` | `` | `./app/actions/handson/all/crm/competitor.ts` | Server Action |
| 381 | CRM | `getContact` | `id: string` | `./app/actions/handson/all/crm/contacts.ts` | Server Action |
| 382 | CRM | `getContacts` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/contacts.ts` | Server Action |
| 383 | CRM | `getContract` | `id: string` | `./app/actions/handson/all/crm/contracts.ts` | Server Action |
| 384 | CRM | `getContracts` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/contracts.ts` | Server Action |
| 385 | CRM | `getDashboardStats` | `fromDate?: string, toDate?: string` | `./app/actions/handson/all/crm/dashboard.ts` | Server Action |
| 386 | CRM | `getDeal` | `id: string` | `./app/actions/handson/all/crm/deals.ts` | Fetches a single Deal (Opportunity) by ID. Aliased as getOpportunity. |
| 387 | CRM | `getDeals` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/deals.ts` | Fetches Deals (Opportunities) with pagination. Aliased as getOpportunities for compatibility. |
| 388 | CRM | `getDocTypeMeta` | `doctype: string` | `./app/actions/handson/all/crm/meta.ts` | Server Action |
| 389 | CRM | `getEmailCampaigns` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/campaigns.ts` | Server Action |
| 390 | CRM | `getGrievanceTypes` | `` | `./app/actions/handson/all/crm/lifecycle.ts` | Server Action |
| 391 | CRM | `getGrievances` | `` | `./app/actions/handson/all/crm/lifecycle.ts` | Server Action |
| 392 | CRM | `getIndustries` | `` | `./app/actions/handson/all/crm/competitor.ts` | Server Action |
| 393 | CRM | `getIssue` | `name: string` | `./app/actions/handson/all/crm/support/issue.ts` | Server Action |
| 394 | CRM | `getIssues` | `` | `./app/actions/handson/all/crm/support/issue.ts` | Server Action |
| 395 | CRM | `getLead` | `id: string` | `./app/actions/handson/all/crm/leads.ts` | Fetches a single Lead by ID. @param id - Lead ID (name) |
| 396 | CRM | `getLeads` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/leads.ts` | Fetches Leads with pagination. @param page - Page number (default 1) @param limit - Items per page (default 20) |
| 397 | CRM | `getLocationTypes` | `` | `./app/actions/handson/all/crm/competitor.ts` | Server Action |
| 398 | CRM | `getNotes` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/notes.ts` | Server Action |
| 399 | CRM | `getNotes` | `` | `./app/actions/handson/all/crm/support/note.ts` | Server Action |
| 400 | CRM | `getOpportunities` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/deals.ts` | Server Action |
| 401 | CRM | `getOpportunity` | `id: string` | `./app/actions/handson/all/crm/deals.ts` | Server Action |
| 402 | CRM | `getOrganization` | `id: string` | `./app/actions/handson/all/crm/organizations.ts` | Server Action |
| 403 | CRM | `getOrganizations` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/organizations.ts` | Server Action |
| 404 | CRM | `getOrgansOfState` | `` | `./app/actions/handson/all/crm/competitor.ts` | Server Action |
| 405 | CRM | `getPolicies` | `` | `./app/actions/handson/all/crm/lifecycle.ts` | Server Action |
| 406 | CRM | `getPolicy` | `name: string` | `./app/actions/handson/all/crm/lifecycle.ts` | Server Action |
| 407 | CRM | `getProspect` | `id: string` | `./app/actions/handson/all/crm/prospects.ts` | Fetches specific Prospect by ID. |
| 408 | CRM | `getProspects` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/prospects.ts` | Fetches Prospects with pagination. |
| 409 | CRM | `getServiceLevelAgreements` | `` | `./app/actions/handson/all/crm/support/sla.ts` | Server Action |
| 410 | CRM | `getSubscriptionPlans` | `` | `./app/actions/handson/all/crm/subscriptions.ts` | Fetches Subscription Plans. |
| 411 | CRM | `getSubscriptions` | `` | `./app/actions/handson/all/crm/subscriptions.ts` | Fetches Subscriptions. |
| 412 | CRM | `getTasks` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/tasks.ts` | Server Action |
| 413 | CRM | `getTimeline` | `doctype: string, docname: string` | `./app/actions/handson/all/crm/timeline.ts` | Server Action |
| 414 | CRM | `getWarnings` | `` | `./app/actions/handson/all/crm/lifecycle.ts` | Server Action |
| 415 | CRM | `getWarrantyClaims` | `` | `./app/actions/handson/all/crm/support/warranty.ts` | Server Action |
| 416 | CRM | `saveDoc` | `doctype: string, data: any, path_to_revalidate?: string` | `./app/actions/handson/all/crm/crud.ts` | Server Action |
| 417 | CRM | `updateCompetitor` | `name: string, data: any` | `./app/actions/handson/all/crm/competitor.ts` | Server Action |
| 418 | CRM | `updateGrievance` | `name: string, data: any` | `./app/actions/handson/all/crm/lifecycle.ts` | Server Action |
| 419 | CRM | `updateIssue` | `name: string, data: Partial<IssueData>` | `./app/actions/handson/all/crm/support/issue.ts` | Server Action |
| 420 | CRM | `updateLead` | `name: string, data: Partial<LeadData>` | `./app/actions/handson/all/crm/leads.ts` | Server Action |
| 421 | CRM | `updateOpportunity` | `name: string, data: Partial<OpportunityData>` | `./app/actions/handson/all/crm/deals.ts` | Updates an existing Deal (Opportunity). |
| 422 | CRM | `updateProspect` | `name: string, data: Partial<ProspectData>` | `./app/actions/handson/all/crm/prospects.ts` | Updates a Prospect. |
| 423 | HRMS | `checkIn` | `data: { employee: string, company: string, timestamp: string }` | `./app/actions/handson/all/hrms/attendance.ts` | Server Action |
| 424 | HRMS | `checkOut` | `data: { employee: string, timestamp: string }` | `./app/actions/handson/all/hrms/attendance.ts` | Server Action |
| 425 | HRMS | `createAppraisal` | `data: any` | `./app/actions/handson/all/hrms/performance.ts` | Server Action |
| 426 | HRMS | `createDepartment` | `data: DepartmentData` | `./app/actions/handson/all/hrms/departments.ts` | Server Action |
| 427 | HRMS | `createDesignation` | `data: DesignationData` | `./app/actions/handson/all/hrms/designations.ts` | Server Action |
| 428 | HRMS | `createEmployee` | `data: EmployeeData` | `./app/actions/handson/all/hrms/employees.ts` | Server Action |
| 429 | HRMS | `createEmployeeAdvance` | `data: EmployeeAdvanceData` | `./app/actions/handson/all/hrms/advances.ts` | Server Action |
| 430 | HRMS | `createExpenseClaim` | `data: ExpenseClaimData` | `./app/actions/handson/all/hrms/expenses.ts` | Server Action |
| 431 | HRMS | `createGoal` | `data: any` | `./app/actions/handson/all/hrms/performance.ts` | Server Action |
| 432 | HRMS | `createJobApplicant` | `data: JobApplicantData` | `./app/actions/handson/all/hrms/recruitment.ts` | Server Action |
| 433 | HRMS | `createJobOpening` | `data: JobOpeningData` | `./app/actions/handson/all/hrms/recruitment.ts` | Server Action |
| 434 | HRMS | `createLeaveApplication` | `data: any` | `./app/actions/handson/all/hrms/leave.ts` | Server Action |
| 435 | HRMS | `createLoan` | `data: any` | `./app/actions/handson/all/hrms/loans.ts` | Server Action |
| 436 | HRMS | `createMyExpenseClaim` | `data: ExpenseClaimData` | `./app/actions/handson/all/hrms/me/expenses.ts` | Server Action |
| 437 | HRMS | `createMyLeaveApplication` | `data: LeaveApplicationData` | `./app/actions/handson/all/hrms/me/leave.ts` | Server Action |
| 438 | HRMS | `createPromotion` | `data: PromotionData` | `./app/actions/handson/all/hrms/promotions.ts` | Server Action |
| 439 | HRMS | `createSalarySlip` | `data: any` | `./app/actions/handson/all/hrms/payroll.ts` | Server Action |
| 440 | HRMS | `createSeparation` | `data: any` | `./app/actions/handson/all/hrms/separations.ts` | Server Action |
| 441 | HRMS | `createShiftAssignment` | `data: ShiftAssignmentData` | `./app/actions/handson/all/hrms/shifts.ts` | Server Action |
| 442 | HRMS | `createTravelRequest` | `data: any` | `./app/actions/handson/all/hrms/travel.ts` | Server Action |
| 443 | HRMS | `getAllAppraisals` | `` | `./app/actions/handson/all/hrms/performance.ts` | Server Action |
| 444 | HRMS | `getAllGoals` | `` | `./app/actions/handson/all/hrms/performance.ts` | Server Action |
| 445 | HRMS | `getAppraisals` | `` | `./app/actions/handson/all/hrms/me/performance.ts` | Server Action |
| 446 | HRMS | `getAttendanceList` | `` | `./app/actions/handson/all/hrms/attendance.ts` | Server Action |
| 447 | HRMS | `getCompanies` | `` | `./app/actions/handson/all/hrms/companies.ts` | Server Action |
| 448 | HRMS | `getDepartments` | `` | `./app/actions/handson/all/hrms/departments.ts` | Server Action |
| 449 | HRMS | `getDesignations` | `` | `./app/actions/handson/all/hrms/designations.ts` | Server Action |
| 450 | HRMS | `getEmployee` | `name: string` | `./app/actions/handson/all/hrms/employees.ts` | Server Action |
| 451 | HRMS | `getEmployeeAdvances` | `` | `./app/actions/handson/all/hrms/advances.ts` | Server Action |
| 452 | HRMS | `getEmployees` | `` | `./app/actions/handson/all/hrms/employees.ts` | Server Action |
| 453 | HRMS | `getExpenseClaimTypes` | `` | `./app/actions/handson/all/hrms/expenses.ts` | Server Action |
