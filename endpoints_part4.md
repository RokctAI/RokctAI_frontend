# API Endpoints (Part 4 of 6)

| No. | App | Endpoint | Payload / Arguments | Path | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 451 | HRMS | `getGoals` | `` | `./app/actions/handson/all/hrms/me/performance.ts` | Server Action |
| 452 | HRMS | `getHolidays` | `year?: string` | `./app/actions/handson/all/hrms/leave.ts` | Server Action |
| 453 | HRMS | `getJobApplicants` | `` | `./app/actions/handson/all/hrms/recruitment.ts` | Server Action |
| 454 | HRMS | `getJobOpening` | `name: string` | `./app/actions/handson/all/hrms/recruitment.ts` | Server Action |
| 455 | HRMS | `getJobOpenings` | `` | `./app/actions/handson/all/hrms/recruitment.ts` | Server Action |
| 456 | HRMS | `getLeaveAllocations` | `employee: string` | `./app/actions/handson/all/hrms/leave.ts` | Server Action |
| 457 | HRMS | `getLeaveApplications` | `` | `./app/actions/handson/all/hrms/leave.ts` | Server Action |
| 458 | HRMS | `getLeaveTypes` | `` | `./app/actions/handson/all/hrms/leave.ts` | Server Action |
| 459 | HRMS | `getLoans` | `` | `./app/actions/handson/all/hrms/loans.ts` | Server Action |
| 460 | HRMS | `getMyAttendanceList` | `` | `./app/actions/handson/all/hrms/me/attendance.ts` | Server Action |
| 461 | HRMS | `getMyExpenseClaims` | `` | `./app/actions/handson/all/hrms/me/expenses.ts` | Server Action |
| 462 | HRMS | `getMyLeaveApplications` | `` | `./app/actions/handson/all/hrms/me/leave.ts` | Server Action |
| 463 | HRMS | `getMyProfile` | `` | `./app/actions/handson/all/hrms/me/employees.ts` | Server Action |
| 464 | HRMS | `getPendingApprovals` | `` | `./app/actions/handson/all/hrms/dashboard.ts` | Server Action |
| 465 | HRMS | `getPromotions` | `` | `./app/actions/handson/all/hrms/promotions.ts` | Server Action |
| 466 | HRMS | `getSalarySlip` | `name: string` | `./app/actions/handson/all/hrms/payroll.ts` | Server Action |
| 467 | HRMS | `getSalarySlips` | `` | `./app/actions/handson/all/hrms/payroll.ts` | Server Action |
| 468 | HRMS | `getSalaryStructures` | `` | `./app/actions/handson/all/hrms/payroll.ts` | Server Action |
| 469 | HRMS | `getSeparations` | `` | `./app/actions/handson/all/hrms/separations.ts` | Server Action |
| 470 | HRMS | `getShiftAssignments` | `` | `./app/actions/handson/all/hrms/shifts.ts` | Server Action |
| 471 | HRMS | `getShiftTypes` | `` | `./app/actions/handson/all/hrms/shifts.ts` | Server Action |
| 472 | HRMS | `getTodayAttendance` | `employee: string` | `./app/actions/handson/all/hrms/attendance.ts` | Server Action |
| 473 | HRMS | `getTravelRequests` | `` | `./app/actions/handson/all/hrms/travel.ts` | Server Action |
| 474 | HRMS | `markMyAttendance` | `data: AttendanceData` | `./app/actions/handson/all/hrms/me/attendance.ts` | Server Action |
| 475 | HRMS | `saveGoal` | `data: any` | `./app/actions/handson/all/hrms/me/performance.ts` | Server Action |
| 476 | HRMS | `submitAppraisal` | `data: any` | `./app/actions/handson/all/hrms/me/performance.ts` | Server Action |
| 477 | HRMS | `updateEmployee` | `name: string, data: Partial<EmployeeData>` | `./app/actions/handson/all/hrms/employees.ts` | Server Action |
| 478 | HRMS | `updateGoal` | `name: string, data: any` | `./app/actions/handson/all/hrms/performance.ts` | Server Action |
| 479 | HRMS | `updateMyProfile` | `data: Partial<EmployeeProfileData>` | `./app/actions/handson/all/hrms/me/employees.ts` | Server Action |
| 480 | LENDING | `createBalanceAdjustment` | `data: { loan: string; amount: number; type: "Debit Adjustment" \| "Credit Adjustment"; remarks?: string }` | `./app/actions/handson/all/lending/lifecycle.ts` | Server Action |
| 481 | LENDING | `createDefaultPawnProduct` | `` | `./app/actions/handson/all/lending/seed_product.ts` | Server Action |
| 482 | LENDING | `createDefaultShortTermProduct` | `` | `./app/actions/handson/all/lending/seed_product.ts` | Server Action |
| 483 | LENDING | `createDefaultUnsecuredProduct` | `` | `./app/actions/handson/all/lending/seed_product.ts` | Server Action |
| 484 | LENDING | `createLoanApplication` | `data: LoanApplicationData` | `./app/actions/handson/all/lending/application.ts` | Server Action |
| 485 | LENDING | `createLoanDemand` | `data: { loan: string; demand_type: "Penalty" \| "Charges"; amount: number; date: string; description?: string; // Mapped to demand_subtype usually or remarks }` | `./app/actions/handson/all/lending/demand.ts` | Server Action |
| 486 | LENDING | `createLoanRefund` | `data: { loan: string; amount: number; type: "Excess" \| "Security" }` | `./app/actions/handson/all/lending/refund.ts` | Server Action |
| 487 | LENDING | `createLoanRepayment` | `data: RepaymentData` | `./app/actions/handson/all/lending/repayment.ts` | Server Action |
| 488 | LENDING | `createLoanRestructure` | `data: { loan: string; date: string; reason?: string; // Simple restructure params (usually just modifying terms` | `./app/actions/handson/all/lending/lifecycle.ts` | Server Action |
| 489 | LENDING | `createLoanTransfer` | `data: { transfer_date: string; from_branch: string; to_branch: string; loans: string[]; // List of Loan IDs company: string; applicant?: string; }` | `./app/actions/handson/all/lending/transfer.ts` | Server Action |
| 490 | LENDING | `createLoanWriteOff` | `loan: string, amount: number` | `./app/actions/handson/all/lending/lifecycle.ts` | Server Action |
| 491 | LENDING | `disburseLoan` | `{ loanId, postingDate }: { loanId: string, postingDate?: string }` | `./app/actions/handson/all/lending/loan.ts` | Server Action |
| 492 | LENDING | `getAssetAccounts` | `company: string` | `./app/actions/handson/all/lending/loan.ts` | Server Action |
| 493 | LENDING | `getBranches` | `` | `./app/actions/handson/all/lending/transfer.ts` | Server Action |
| 494 | LENDING | `getLendingReport` | `reportName: string, filters: any = {}` | `./app/actions/handson/all/lending/reports.ts` | Server Action |
| 495 | LENDING | `getLoan` | `id: string` | `./app/actions/handson/all/lending/loan.ts` | Server Action |
| 496 | LENDING | `getLoanApplication` | `id: string` | `./app/actions/handson/all/lending/application.ts` | Server Action |
| 497 | LENDING | `getLoanApplications` | `page = 1, limit = 20` | `./app/actions/handson/all/lending/application.ts` | Server Action |
| 498 | LENDING | `getLoanProduct` | `name: string` | `./app/actions/handson/all/lending/product.ts` | Server Action |
| 499 | LENDING | `getLoanProducts` | `` | `./app/actions/handson/all/lending/product.ts` | Server Action |
| 500 | LENDING | `getLoanRepaymentSchedule` | `loanId: string` | `./app/actions/handson/all/lending/loan.ts` | Server Action |
| 501 | LENDING | `getLoanRepayments` | `page = 1, limit = 20` | `./app/actions/handson/all/lending/repayment.ts` | Server Action |
| 502 | LENDING | `getLoanTimeline` | `loanId: string` | `./app/actions/handson/all/lending/loan.ts` | Server Action |
| 503 | LENDING | `getLoans` | `page = 1, limit = 20, filters: any = {}` | `./app/actions/handson/all/lending/loan.ts` | Server Action |
| 504 | LENDING | `getLoansByBranch` | `branch: string, applicant?: string` | `./app/actions/handson/all/lending/transfer.ts` | Server Action |
| 505 | LENDING | `getNCRForm40Data` | `filters: any = {}` | `./app/actions/handson/all/lending/ncr_reports.ts` | Server Action |
| 506 | LENDING | `getProcessLogs` | `limit = 10` | `./app/actions/handson/all/lending/operations.ts` | Server Action |
| 507 | LENDING | `realisePawnAsset` | `{ loan, asset_account }: { loan: string, asset_account: string }` | `./app/actions/handson/all/lending/loan.ts` | Server Action |
| 508 | LENDING | `releaseSecurity` | `{ loanId }: { loanId: string }` | `./app/actions/handson/all/lending/loan.ts` | Server Action |
| 509 | LENDING | `runDecisionEngine` | `applicationId: string` | `./app/actions/handson/all/lending/decision_engine.ts` | Server Action |
| 510 | LENDING | `triggerLoanClassification` | `` | `./app/actions/handson/all/lending/operations.ts` | Server Action |
| 511 | LENDING | `triggerLoanInterestAccrual` | `postingDate?: string` | `./app/actions/handson/all/lending/operations.ts` | Server Action |
| 512 | LENDING | `triggerLoanSecurityShortfall` | `` | `./app/actions/handson/all/lending/operations.ts` | Server Action |
| 513 | LENDING | `updateLoanApplication` | `name: string, data: Partial<LoanApplicationData>` | `./app/actions/handson/all/lending/application.ts` | Server Action |
| 514 | LMS | `checkAnswer` | `questionName: string, type: string, answers: any[]` | `./app/actions/handson/all/lms/quiz/actions.ts` | Server Action |
| 515 | LMS | `checkReviewStatus` | `courseName: string, user: string` | `./app/actions/handson/all/lms/reviews/actions.ts` | Server Action |
| 516 | LMS | `createDiscussionReplyAction` | `topic: string, reply: string, path?: string` | `./app/actions/handson/all/lms/discussions/actions.ts` | Server Action |
| 517 | LMS | `createDiscussionTopicAction` | `doctype: string, docname: string, title: string` | `./app/actions/handson/all/lms/discussions/actions.ts` | Server Action |
| 518 | LMS | `createReviewAction` | `courseName: string, rating: number, reviewText: string` | `./app/actions/handson/all/lms/reviews/actions.ts` | Server Action |
| 519 | LMS | `fetchAssignment` | `assignmentName: string` | `./app/actions/handson/all/lms/assignments/actions.ts` | Server Action |
| 520 | LMS | `fetchCertificates` | `` | `./app/actions/handson/all/lms/user/actions.ts` | Server Action |
| 521 | LMS | `fetchCourseByName` | `courseName: string` | `./app/actions/handson/all/lms/courses/actions.ts` | Server Action |
| 522 | LMS | `fetchCourseReviews` | `courseName: string` | `./app/actions/handson/all/lms/reviews/actions.ts` | Server Action |
| 523 | LMS | `fetchCourses` | `` | `./app/actions/handson/all/lms/courses/actions.ts` | Server Action |
| 524 | LMS | `fetchDiscussionReplies` | `topic: string` | `./app/actions/handson/all/lms/discussions/actions.ts` | Server Action |
| 525 | LMS | `fetchDiscussionTopics` | `doctype: string, docname: string` | `./app/actions/handson/all/lms/discussions/actions.ts` | Server Action |
| 526 | LMS | `fetchJob` | `jobName: string` | `./app/actions/handson/all/lms/jobs/actions.ts` | Server Action |
| 527 | LMS | `fetchJobs` | `` | `./app/actions/handson/all/lms/jobs/actions.ts` | Server Action |
| 528 | LMS | `fetchLesson` | `courseName: string, lesson: string, chapter?: string` | `./app/actions/handson/all/lms/courses/actions.ts` | Fetch lesson content and details used in the Lesson Viewer. If chapter is not provided, it looks it up from the course details. |
| 529 | LMS | `fetchMyBatches` | `` | `./app/actions/handson/all/lms/batches/actions.ts` | Server Action |
| 530 | LMS | `fetchMyCourses` | `` | `./app/actions/handson/all/lms/courses/actions.ts` | Server Action |
| 531 | LMS | `fetchMyLiveClasses` | `` | `./app/actions/handson/all/lms/events/actions.ts` | Server Action |
| 532 | LMS | `fetchMySubmission` | `assignmentName: string` | `./app/actions/handson/all/lms/assignments/actions.ts` | Server Action |
| 533 | LMS | `fetchProfile` | `` | `./app/actions/handson/all/lms/user/actions.ts` | Server Action |
| 534 | LMS | `fetchQuestionDetails` | `questionName: string` | `./app/actions/handson/all/lms/quiz/actions.ts` | Server Action |
| 535 | LMS | `fetchQuiz` | `quizName: string` | `./app/actions/handson/all/lms/quiz/actions.ts` | Server Action |
| 536 | LMS | `fetchQuizAttempts` | `quizName: string` | `./app/actions/handson/all/lms/quiz/actions.ts` | Server Action |
| 537 | LMS | `fetchQuizSummary` | `quizName: string` | `./app/actions/handson/all/lms/quiz/actions.ts` | Server Action |
| 538 | LMS | `fetchStreakInfo` | `` | `./app/actions/handson/all/lms/user/actions.ts` | Server Action |
| 539 | LMS | `fetchUpcomingEvaluations` | `` | `./app/actions/handson/all/lms/events/actions.ts` | Server Action |
| 540 | LMS | `fetchUserInfo` | `` | `./app/actions/handson/all/lms/user/actions.ts` | Server Action |
| 541 | LMS | `saveLessonProgress` | `courseName: string, lessonName: string` | `./app/actions/handson/all/lms/courses/actions.ts` | Save lesson progress |
| 542 | LMS | `submitAssignmentAction` | `assignmentName: string, data: { answer?: string, attachment?: string, submissionName?: string }` | `./app/actions/handson/all/lms/assignments/actions.ts` | Server Action |
| 543 | LMS | `updateProfileAction` | `data: any` | `./app/actions/handson/all/lms/user/actions.ts` | Server Action |
| 544 | PAAS-ADMIN-CONTENT.TS | `createFAQ` | `data: any` | `./app/actions/paas/admin/content.ts` | Server Action |
| 545 | PAAS-ADMIN-CONTENT.TS | `deleteFAQ` | `name: string` | `./app/actions/paas/admin/content.ts` | Server Action |
| 546 | PAAS-ADMIN-CONTENT.TS | `getBanners` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` | Server Action |
| 547 | PAAS-ADMIN-CONTENT.TS | `getBlogs` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` | Server Action |
| 548 | PAAS-ADMIN-CONTENT.TS | `getBrands` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` | Server Action |
| 549 | PAAS-ADMIN-CONTENT.TS | `getCareerCategories` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` | Server Action |
| 550 | PAAS-ADMIN-CONTENT.TS | `getCareers` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` | Server Action |
| 551 | PAAS-ADMIN-CONTENT.TS | `getFAQs` | `` | `./app/actions/paas/admin/content.ts` | Server Action |
| 552 | PAAS-ADMIN-CONTENT.TS | `getGallery` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` | Server Action |
| 553 | PAAS-ADMIN-CONTENT.TS | `getNotifications` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` | Server Action |
| 554 | PAAS-ADMIN-CONTENT.TS | `getStories` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` | Server Action |
| 555 | PAAS-ADMIN-CONTENT.TS | `getUnits` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` | Server Action |
| 556 | PAAS-ADMIN-CONTENT.TS | `updateFAQ` | `name: string, data: any` | `./app/actions/paas/admin/content.ts` | Server Action |
| 557 | PAAS-ADMIN-CUSTOMERS.TS | `getDeliverymanPayments` | `status: string = "Pending", page: number = 1, limit: number = 20` | `./app/actions/paas/admin/customers.ts` | Server Action |
| 558 | PAAS-ADMIN-CUSTOMERS.TS | `getSellerPayments` | `status: string = "Pending", page: number = 1, limit: number = 20` | `./app/actions/paas/admin/customers.ts` | Server Action |
| 559 | PAAS-ADMIN-CUSTOMERS.TS | `getSubscriberMessages` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/customers.ts` | Server Action |
| 560 | PAAS-ADMIN-CUSTOMERS.TS | `getSubscribers` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/customers.ts` | Server Action |
| 561 | PAAS-ADMIN-CUSTOMERS.TS | `getWallets` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/customers.ts` | Server Action |
| 562 | PAAS-ADMIN-DASHBOARD.TS | `getAdminStatistics` | `` | `./app/actions/paas/admin/dashboard.ts` | Server Action |
| 563 | PAAS-ADMIN-DELIVERYMAN.TS | `getDeliveries` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/deliveryman.ts` | Server Action |
| 564 | PAAS-ADMIN-DELIVERYMAN.TS | `getDeliveryStatistics` | `` | `./app/actions/paas/admin/deliveryman.ts` | Server Action |
| 565 | PAAS-ADMIN-DELIVERYMAN.TS | `getDeliverymanRequests` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/deliveryman.ts` | Server Action |
| 566 | PAAS-ADMIN-DELIVERYMAN.TS | `getDeliverymanReviews` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/deliveryman.ts` | Server Action |
| 567 | PAAS-ADMIN-DELIVERYMAN.TS | `updateDeliverymanRequest` | `name: string, status: string` | `./app/actions/paas/admin/deliveryman.ts` | Server Action |
| 568 | PAAS-ADMIN-FINANCE.TS | `getPaymentPayloads` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/finance.ts` | Server Action |
| 569 | PAAS-ADMIN-FINANCE.TS | `getPayouts` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/finance.ts` | Server Action |
| 570 | PAAS-ADMIN-FINANCE.TS | `getSalesReport` | `fromDate: string, toDate: string, company?: string` | `./app/actions/paas/admin/finance.ts` | Server Action |
| 571 | PAAS-ADMIN-FINANCE.TS | `getTransactions` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/finance.ts` | Server Action |
| 572 | PAAS-ADMIN-FINANCE.TS | `getWalletHistory` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/finance.ts` | Server Action |
| 573 | PAAS-ADMIN-LOGISTICS.TS | `createVehicleType` | `data: any` | `./app/actions/paas/admin/logistics.ts` | Server Action |
| 574 | PAAS-ADMIN-LOGISTICS.TS | `deleteVehicleType` | `name: string` | `./app/actions/paas/admin/logistics.ts` | Server Action |
| 575 | PAAS-ADMIN-LOGISTICS.TS | `getDeliverySettings` | `` | `./app/actions/paas/admin/logistics.ts` | Server Action |
| 576 | PAAS-ADMIN-LOGISTICS.TS | `getDeliveryZones` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/logistics.ts` | Server Action |
| 577 | PAAS-ADMIN-LOGISTICS.TS | `getVehicleTypes` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/logistics.ts` | Server Action |
| 578 | PAAS-ADMIN-LOGISTICS.TS | `updateDeliverySettings` | `settings: any` | `./app/actions/paas/admin/logistics.ts` | Server Action |
| 579 | PAAS-ADMIN-MARKETING.TS | `createReferral` | `data: any` | `./app/actions/paas/admin/marketing.ts` | Server Action |
| 580 | PAAS-ADMIN-MARKETING.TS | `deleteReferral` | `name: string` | `./app/actions/paas/admin/marketing.ts` | Server Action |
| 581 | PAAS-ADMIN-MARKETING.TS | `getAds` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/marketing.ts` | Server Action |
| 582 | PAAS-ADMIN-MARKETING.TS | `getCashbackRules` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/marketing.ts` | Server Action |
| 583 | PAAS-ADMIN-MARKETING.TS | `getEmailSubscribers` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/marketing.ts` | Server Action |
| 584 | PAAS-ADMIN-MARKETING.TS | `getReferrals` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/marketing.ts` | Server Action |
| 585 | PAAS-ADMIN-MARKETING.TS | `getShopAdsPackages` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/marketing.ts` | Server Action |
| 586 | PAAS-ADMIN-MARKETING.TS | `getShopBonuses` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/marketing.ts` | Server Action |
| 587 | PAAS-ADMIN-ORDERS.TS | `getBookings` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/orders.ts` | Server Action |
| 588 | PAAS-ADMIN-ORDERS.TS | `getOrderReviews` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/orders.ts` | Server Action |
| 589 | PAAS-ADMIN-ORDERS.TS | `getOrderStatuses` | `` | `./app/actions/paas/admin/orders.ts` | Server Action |
| 590 | PAAS-ADMIN-ORDERS.TS | `getOrders` | `page: number = 1, limit: number = 20, type: string = "", status: string = ""` | `./app/actions/paas/admin/orders.ts` | Server Action |
| 591 | PAAS-ADMIN-ORDERS.TS | `getParcelOrders` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/orders.ts` | Server Action |
| 592 | PAAS-ADMIN-ORDERS.TS | `getRefunds` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/orders.ts` | Server Action |
| 593 | PAAS-ADMIN-ORDERS.TS | `updateOrderStatus` | `name: string, status: string` | `./app/actions/paas/admin/orders.ts` | Server Action |
| 594 | PAAS-ADMIN-ORDERS.TS | `updateRefund` | `name: string, status: string, answer?: string` | `./app/actions/paas/admin/orders.ts` | Server Action |
| 595 | PAAS-ADMIN-POS.TS | `createPOSOrder` | `orderData: any` | `./app/actions/paas/admin/pos.ts` | Server Action |
| 596 | PAAS-ADMIN-POS.TS | `getPOSCategories` | `` | `./app/actions/paas/admin/pos.ts` | Server Action |
| 597 | PAAS-ADMIN-POS.TS | `getPOSProducts` | `category: string = "", search: string = "", page: number = 1, limit: number = 20` | `./app/actions/paas/admin/pos.ts` | Server Action |
| 598 | PAAS-ADMIN-PRODUCTS.TS | `getAllCategories` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/products.ts` | Server Action |
| 599 | PAAS-ADMIN-PRODUCTS.TS | `getAllProductExtraGroups` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/products.ts` | Server Action |
| 600 | PAAS-ADMIN-PRODUCTS.TS | `getAllProductReviews` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/products.ts` | Server Action |
