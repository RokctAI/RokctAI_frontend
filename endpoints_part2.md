# API Endpoints (Part 2 of 6)
Total Interactions: 150

| No. | App | Endpoint | Payload / Arguments | Path | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 151 | AI-MEETINGS | `getMyEvents` | `data: { modelId?: string } = {}` | `./app/actions/ai/meetings.ts` | Server Action |
| 152 | AI-NOTIFICATIONS | `createNotification` | `recipientEmail: string, subject: string, message: string, link?: string` | `./app/actions/ai/notifications.ts` | Creates a system notification for a specific user. Uses standard Frappe 'Notification Log' doctype. |
| 153 | AI-NOTIFICATIONS | `notifyDecision` | `doctype: string, docname: string, status: "Approved" \| "Rejected"` | `./app/actions/ai/notifications.ts` | Server Action |
| 154 | AI-ONBOARDING | `completeOnboarding` | `` | `./app/actions/ai/onboarding.ts` | Marks the onboarding as complete locally. In a real flow, this would trigger the push to the Tenant Site. |
| 155 | AI-ONBOARDING | `saveOnboardingProgress` | `planData: Partial<StrategicPlan>` | `./app/actions/ai/onboarding.ts` | Saves the draft onboarding plan to the local database. This is called by the AI during the "waiting period" while the site provisions. |
| 156 | AI-ONBOARDING | `syncOnboardingToSite` | `userEmail: string` | `./app/actions/ai/onboarding.ts` | Dummy Script: Pushes the saved plan to the Tenant Site. This corresponds to the user's request: "once site is ready we push it to the site". |
| 157 | AI-RECRUITMENT | `getJobApplicants` | `data: { modelId?: string } = {}` | `./app/actions/ai/recruitment.ts` | Server Action |
| 158 | AI-RECRUITMENT | `getJobOpenings` | `data: { modelId?: string } = {}` | `./app/actions/ai/recruitment.ts` | Server Action |
| 159 | AI-SMART_STATUS | `updateSmartStatus` | `{ query, status, document_type }: SmartActionInput` | `./app/actions/ai/smart_status.ts` | Server Action |
| 160 | AI-STRATEGY | `getMyOkrs` | `data: { modelId?: string } = {}` | `./app/actions/ai/strategy.ts` | Server Action |
| 161 | AI-SUPPLY_CHAIN | `checkStock` | `data: { itemQuery: string }` | `./app/actions/ai/supply_chain.ts` | Server Action |
| 162 | AI-SUPPLY_CHAIN | `createAiPurchaseOrder` | `data: { supplier: string, items: { item: string, qty: number }[] }` | `./app/actions/ai/supply_chain.ts` | Server Action |
| 163 | AI-SUPPLY_CHAIN | `createAiStockEntry` | `data: { source_warehouse: string, target_warehouse: string, items: { item: string, qty: number }[] }` | `./app/actions/ai/supply_chain.ts` | Server Action |
| 164 | AI-SUPPLY_CHAIN | `getActiveQuotations` | `data: { modelId?: string } = {}` | `./app/actions/ai/supply_chain.ts` | Server Action |
| 165 | AI-SUPPLY_CHAIN | `getPurchaseOrders` | `data: { modelId?: string } = {}` | `./app/actions/ai/supply_chain.ts` | Server Action |
| 166 | AI-TENANT | `contactSupport` | `data: { subject: string, message: string, modelId?: string }` | `./app/actions/ai/tenant.ts` | Server Action |
| 167 | AI-TENANT | `getBillingStatus` | `data: { modelId?: string } = {}` | `./app/actions/ai/tenant.ts` | Server Action |
| 168 | AI-WORK | `getMyProjects` | `data: { modelId?: string } = {}` | `./app/actions/ai/work.ts` | Server Action |
| 169 | AI-WORK | `getMyTasks` | `data: { modelId?: string } = {}` | `./app/actions/ai/work.ts` | Server Action |
| 170 | API | `/api/ai/quota` | `GET` | `./app/api/ai/quota/route.ts` | Route Handler |
| 171 | API | `/api/ai/text` | `POST` | `./app/api/ai/text/route.ts` | Route Handler |
| 172 | API | `/api/notes` | `POST` | `./app/api/notes/route.ts` | Route Handler |
| 173 | API | `/api/projects` | `POST` | `./app/api/projects/route.ts` | Route Handler |
| 174 | API | `/api/tasks` | `POST` | `./app/api/tasks/route.ts` | Route Handler |
| 175 | API | `/api/webhooks/user-sync` | `POST` | `./app/api/webhooks/user-sync/route.ts` | Route Handler |
| 176 | AUTH | `/api/auth/[...nextauth]` | `GET, POST` | `./app/(auth)/api/auth/[...nextauth]/route.ts` | Route Handler |
| 177 | AUTH | `getCurrentSession` | `` | `./app/(auth)/actions.ts` | Server Action |
| 178 | AUTH | `getIndustries` | `` | `./app/(auth)/actions.ts` | Server Action |
| 179 | AUTH | `login` | `prevState: ActionState, formData: FormData,` | `./app/(auth)/actions.ts` | Server Action |
| 180 | AUTH | `register` | `prevState: ActionState, formData: FormData,` | `./app/(auth)/actions.ts` | Server Action |
| 181 | CHAT | `/api/chat` | `DELETE, POST` | `./app/(chat)/api/chat/route.ts` | Route Handler |
| 182 | CHAT | `/api/files/upload` | `POST` | `./app/(chat)/api/files/upload/route.ts` | Route Handler |
| 183 | CHAT | `/api/history` | `GET` | `./app/(chat)/api/history/route.ts` | Route Handler |
| 184 | CHAT | `/api/history/clear` | `POST` | `./app/(chat)/api/history/clear/route.ts` | Route Handler |
| 185 | CHAT | `/api/reminders/pending` | `GET` | `./app/(chat)/api/reminders/pending/route.ts` | Route Handler |
| 186 | CHAT | `/api/reservation` | `GET, PATCH` | `./app/(chat)/api/reservation/route.ts` | Route Handler |
| 187 | CONTROL-ANNOUNCEMENTS | `deleteGlobalAnnouncement` | `name: string` | `./app/actions/handson/control/announcements/announcements.ts` | Server Action |
| 188 | CONTROL-ANNOUNCEMENTS | `getGlobalAnnouncements` | `` | `./app/actions/handson/control/announcements/announcements.ts` | Server Action |
| 189 | CONTROL-ANNOUNCEMENTS | `saveGlobalAnnouncement` | `ann: Announcement` | `./app/actions/handson/control/announcements/announcements.ts` | Server Action |
| 190 | CONTROL-ANNOUNCEMENTS | `seedAnnouncements` | `` | `./app/actions/handson/control/announcements/announcements.ts` | Server Action |
| 191 | CONTROL-DEVELOPER | `deleteExcludedDoctype` | `name: string` | `./app/actions/handson/control/developer/developer.ts` | Server Action |
| 192 | CONTROL-DEVELOPER | `deleteExcludedSwaggerDoctype` | `name: string` | `./app/actions/handson/control/developer/developer.ts` | Server Action |
| 193 | CONTROL-DEVELOPER | `deleteExcludedSwaggerModule` | `name: string` | `./app/actions/handson/control/developer/developer.ts` | Server Action |
| 194 | CONTROL-DEVELOPER | `deleteSwaggerAppRename` | `name: string` | `./app/actions/handson/control/developer/developer.ts` | Server Action |
| 195 | CONTROL-DEVELOPER | `generateSwaggerDocumentation` | `` | `./app/actions/handson/control/developer/developer.ts` | Server Action |
| 196 | CONTROL-DEVELOPER | `getExcludedDoctypes` | `` | `./app/actions/handson/control/developer/developer.ts` | Server Action |
| 197 | CONTROL-DEVELOPER | `getExcludedSwaggerDoctypes` | `` | `./app/actions/handson/control/developer/developer.ts` | Server Action |
| 198 | CONTROL-DEVELOPER | `getExcludedSwaggerModules` | `` | `./app/actions/handson/control/developer/developer.ts` | Server Action |
| 199 | CONTROL-DEVELOPER | `getRawNeurotrophinCache` | `` | `./app/actions/handson/control/developer/developer.ts` | Server Action |
| 200 | CONTROL-DEVELOPER | `getRawTenderCache` | `` | `./app/actions/handson/control/developer/developer.ts` | Server Action |
| 201 | CONTROL-DEVELOPER | `getSwaggerAppRenames` | `` | `./app/actions/handson/control/developer/developer.ts` | Server Action |
| 202 | CONTROL-DEVELOPER | `getSwaggerSettings` | `` | `./app/actions/handson/control/developer/developer.ts` | Server Action |
| 203 | CONTROL-DEVELOPER | `getTenantErrorLogs` | `` | `./app/actions/handson/control/developer/developer.ts` | Server Action |
| 204 | CONTROL-FINANCE | `createCustomerWallet` | `data: any` | `./app/actions/handson/control/finance/finance.ts` | Server Action |
| 205 | CONTROL-FINANCE | `createTenantPayoutRequest` | `data: any` | `./app/actions/handson/control/finance/finance.ts` | Server Action |
| 206 | CONTROL-FINANCE | `createWalletLedger` | `data: any` | `./app/actions/handson/control/finance/finance.ts` | Server Action |
| 207 | CONTROL-FINANCE | `deleteCustomerWallet` | `name: string` | `./app/actions/handson/control/finance/finance.ts` | Server Action |
| 208 | CONTROL-FINANCE | `deleteTenantPayoutRequest` | `name: string` | `./app/actions/handson/control/finance/finance.ts` | Server Action |
| 209 | CONTROL-FINANCE | `deleteWalletLedger` | `name: string` | `./app/actions/handson/control/finance/finance.ts` | Server Action |
| 210 | CONTROL-FINANCE | `getCustomerWallets` | `` | `./app/actions/handson/control/finance/finance.ts` | Server Action |
| 211 | CONTROL-FINANCE | `getTenantPayoutRequests` | `` | `./app/actions/handson/control/finance/finance.ts` | Server Action |
| 212 | CONTROL-FINANCE | `getWalletLedgers` | `` | `./app/actions/handson/control/finance/finance.ts` | Server Action |
| 213 | CONTROL-FINANCE | `updateCustomerWallet` | `name: string, data: any` | `./app/actions/handson/control/finance/finance.ts` | Server Action |
| 214 | CONTROL-FINANCE | `updateTenantPayoutRequest` | `name: string, data: any` | `./app/actions/handson/control/finance/finance.ts` | Server Action |
| 215 | CONTROL-FINANCE | `updateWalletLedger` | `name: string, data: any` | `./app/actions/handson/control/finance/finance.ts` | Server Action |
| 216 | CONTROL-NOTIFICATIONS | `createMasterTemplate` | `name: string, subject: string, content: string` | `./app/actions/handson/control/notifications/templates.ts` | Creates a new Master Email Template if it doesn't exist. |
| 217 | CONTROL-NOTIFICATIONS | `getMasterTemplates` | `` | `./app/actions/handson/control/notifications/templates.ts` | Fetches all Email Templates from the Control Site. |
| 218 | CONTROL-NOTIFICATIONS | `saveMasterTemplate` | `name: string, subject: string, content: string` | `./app/actions/handson/control/notifications/templates.ts` | Updates a Master Email Template. |
| 219 | CONTROL-PRINT_FORMATS | `deleteMasterPrintFormat` | `name: string` | `./app/actions/handson/control/print_formats/print_formats.ts` | Server Action |
| 220 | CONTROL-PRINT_FORMATS | `getMasterPrintFormats` | `doctype?: string` | `./app/actions/handson/control/print_formats/print_formats.ts` | Fetches all Print Formats from the Control Site. |
| 221 | CONTROL-PRINT_FORMATS | `saveMasterPrintFormat` | `name: string, doctype: string, html: string` | `./app/actions/handson/control/print_formats/print_formats.ts` | Creates or Updates a Master Print Format. |
| 222 | CONTROL-REPORTS | `deleteGlobalReport` | `name: string` | `./app/actions/handson/control/reports/reports.ts` | Server Action |
| 223 | CONTROL-REPORTS | `getGlobalReports` | `` | `./app/actions/handson/control/reports/reports.ts` | Fetches all Global Report Definitions. Stored in "SaaS Configuration Item" with category="Report Definition". |
| 224 | CONTROL-REPORTS | `saveGlobalReport` | `report: ReportDefinition` | `./app/actions/handson/control/reports/reports.ts` | Save a Global Report Definition. |
| 225 | CONTROL-REPORTS | `seedReports` | `` | `./app/actions/handson/control/reports/reports.ts` | Seeds some example reports. |
| 226 | CONTROL-RPANEL | `clearLog` | `website: string, logType: string` | `./app/actions/handson/control/rpanel/logs/view-logs.ts` | Server Action |
| 227 | CONTROL-RPANEL | `createBackup` | `website: string, backup_type: string = 'Full'` | `./app/actions/handson/control/rpanel/backups/manage-backup.ts` | Server Action |
| 228 | CONTROL-RPANEL | `createCronJob` | `data: any` | `./app/actions/handson/control/rpanel/cron/manage-cron.ts` | Server Action |
| 229 | CONTROL-RPANEL | `createEmailAccount` | `website: string, emailUser: string, password: string` | `./app/actions/handson/control/rpanel/emails/manage-email.ts` | Server Action |
| 230 | CONTROL-RPANEL | `createFtpAccount` | `website: string, username: string, password: string` | `./app/actions/handson/control/rpanel/ftp/manage-ftp.ts` | Server Action |
| 231 | CONTROL-RPANEL | `createWebsite` | `data: any` | `./app/actions/handson/control/rpanel/websites/create-website.ts` | Server Action |
| 232 | CONTROL-RPANEL | `deleteBackup` | `backup_id: string` | `./app/actions/handson/control/rpanel/backups/manage-backup.ts` | Server Action |
| 233 | CONTROL-RPANEL | `deleteCronJob` | `name: string` | `./app/actions/handson/control/rpanel/cron/manage-cron.ts` | Server Action |
| 234 | CONTROL-RPANEL | `deleteEmailAccount` | `website: string, emailUser: string` | `./app/actions/handson/control/rpanel/emails/manage-email.ts` | Server Action |
| 235 | CONTROL-RPANEL | `deleteFile` | `website: string, filePath: string` | `./app/actions/handson/control/rpanel/files.ts` | Server Action |
| 236 | CONTROL-RPANEL | `deleteFtpAccount` | `name: string` | `./app/actions/handson/control/rpanel/ftp/manage-ftp.ts` | Server Action |
| 237 | CONTROL-RPANEL | `deleteWebsite` | `websiteName: string` | `./app/actions/handson/control/rpanel/websites/manage-website.ts` | Server Action |
| 238 | CONTROL-RPANEL | `getBackups` | `website?: string` | `./app/actions/handson/control/rpanel/backups/manage-backup.ts` | Server Action |
| 239 | CONTROL-RPANEL | `getClientUsage` | `` | `./app/actions/handson/control/rpanel/dashboard/get-client-usage.ts` | Server Action |
| 240 | CONTROL-RPANEL | `getClientWebsites` | `clientName?: string` | `./app/actions/handson/control/rpanel/websites/get-client-websites.ts` | Server Action |
| 241 | CONTROL-RPANEL | `getCronJobs` | `website?: string` | `./app/actions/handson/control/rpanel/cron/manage-cron.ts` | Server Action |
| 242 | CONTROL-RPANEL | `getDatabases` | `clientName?: string` | `./app/actions/handson/control/rpanel/databases/manage-database.ts` | Server Action |
| 243 | CONTROL-RPANEL | `getEmails` | `clientName?: string` | `./app/actions/handson/control/rpanel/emails/manage-email.ts` | Server Action |
| 244 | CONTROL-RPANEL | `getFiles` | `website: string, path: string` | `./app/actions/handson/control/rpanel/files.ts` | Server Action |
| 245 | CONTROL-RPANEL | `getFtpAccounts` | `clientName?: string` | `./app/actions/handson/control/rpanel/ftp/manage-ftp.ts` | Server Action |
| 246 | CONTROL-RPANEL | `getLogContent` | `website: string, logType: string, lines: number = 100` | `./app/actions/handson/control/rpanel/logs/view-logs.ts` | Server Action |
| 247 | CONTROL-RPANEL | `getLogStats` | `website: string` | `./app/actions/handson/control/rpanel/logs/view-logs.ts` | Server Action |
| 248 | CONTROL-RPANEL | `getServerInfo` | `` | `./app/actions/handson/control/rpanel/dashboard/get-server-info.ts` | Server Action |
| 249 | CONTROL-RPANEL | `issueSSL` | `websiteName: string` | `./app/actions/handson/control/rpanel/websites/manage-website.ts` | Server Action |
| 250 | CONTROL-RPANEL | `restoreBackup` | `backup_id: string` | `./app/actions/handson/control/rpanel/backups/manage-backup.ts` | Server Action |
| 251 | CONTROL-RPANEL | `updateCronJob` | `name: string, data: any` | `./app/actions/handson/control/rpanel/cron/manage-cron.ts` | Server Action |
| 252 | CONTROL-RPANEL | `updateDatabasePassword` | `websiteName: string, newPassword: string` | `./app/actions/handson/control/rpanel/databases/manage-database.ts` | Server Action |
| 253 | CONTROL-RPANEL | `updateEmailPassword` | `website: string, emailUser: string, newPassword: string` | `./app/actions/handson/control/rpanel/emails/manage-email.ts` | Server Action |
| 254 | CONTROL-RPANEL | `updateFtpPassword` | `name: string, newPassword: string` | `./app/actions/handson/control/rpanel/ftp/manage-ftp.ts` | Server Action |
| 255 | CONTROL-RPANEL | `updateWebsite` | `websiteName: string, data: any` | `./app/actions/handson/control/rpanel/websites/manage-website.ts` | Server Action |
| 256 | CONTROL-SUBSCRIPTIONS | `createCompanySubscription` | `data: any` | `./app/actions/handson/control/subscriptions/subscriptions.ts` | Server Action |
| 257 | CONTROL-SUBSCRIPTIONS | `createSubscriptionPlan` | `data: any` | `./app/actions/handson/control/subscriptions/subscriptions.ts` | Server Action |
| 258 | CONTROL-SUBSCRIPTIONS | `deleteCompanySubscription` | `name: string` | `./app/actions/handson/control/subscriptions/subscriptions.ts` | Server Action |
| 259 | CONTROL-SUBSCRIPTIONS | `deleteSubscriptionPlan` | `name: string` | `./app/actions/handson/control/subscriptions/subscriptions.ts` | Server Action |
| 260 | CONTROL-SUBSCRIPTIONS | `getCompanySubscriptions` | `` | `./app/actions/handson/control/subscriptions/subscriptions.ts` | Server Action |
| 261 | CONTROL-SUBSCRIPTIONS | `getCustomers` | `` | `./app/actions/handson/control/subscriptions/subscriptions.ts` | Server Action |
| 262 | CONTROL-SUBSCRIPTIONS | `getModuleDefs` | `` | `./app/actions/handson/control/subscriptions/subscriptions.ts` | Server Action |
| 263 | CONTROL-SUBSCRIPTIONS | `getSubscriptionPlan` | `name: string` | `./app/actions/handson/control/subscriptions/subscriptions.ts` | Server Action |
| 264 | CONTROL-SUBSCRIPTIONS | `getSubscriptionPlans` | `` | `./app/actions/handson/control/subscriptions/subscriptions.ts` | Server Action |
| 265 | CONTROL-SUBSCRIPTIONS | `getSubscriptionSettings` | `` | `./app/actions/handson/control/subscriptions/subscriptions.ts` | Server Action |
| 266 | CONTROL-SUBSCRIPTIONS | `loginAsTenant` | `companyName: string` | `./app/actions/handson/control/subscriptions/subscriptions.ts` | Server Action |
| 267 | CONTROL-SUBSCRIPTIONS | `updateCompanySubscription` | `name: string, data: any` | `./app/actions/handson/control/subscriptions/subscriptions.ts` | Server Action |
| 268 | CONTROL-SUBSCRIPTIONS | `updateSubscriptionPlan` | `name: string, data: any` | `./app/actions/handson/control/subscriptions/subscriptions.ts` | Server Action |
| 269 | CONTROL-SUBSCRIPTIONS | `updateSubscriptionSettings` | `name: string, data: any` | `./app/actions/handson/control/subscriptions/subscriptions.ts` | Server Action |
| 270 | CONTROL-SYSTEM | `approveUpdate` | `name: string` | `./app/actions/handson/control/system/system.ts` | Server Action |
| 271 | CONTROL-SYSTEM | `deleteConfigItem` | `name: string` | `./app/actions/handson/control/system/master_config.ts` | Server Action |
| 272 | CONTROL-SYSTEM | `deleteUpdateAuthorization` | `name: string` | `./app/actions/handson/control/system/system.ts` | Server Action |
| 273 | CONTROL-SYSTEM | `getBrainSettings` | `` | `./app/actions/handson/control/system/system.ts` | Server Action |
| 274 | CONTROL-SYSTEM | `getGlobalSettings` | `` | `./app/actions/handson/control/system/global-settings.ts` | Server Action |
| 275 | CONTROL-SYSTEM | `getMasterConfigItems` | `regionFilter?: string, categoryFilter?: string` | `./app/actions/handson/control/system/master_config.ts` | Server Action |
| 276 | CONTROL-SYSTEM | `getUpdateAuthorizations` | `` | `./app/actions/handson/control/system/system.ts` | Server Action |
| 277 | CONTROL-SYSTEM | `getWeatherSettings` | `` | `./app/actions/handson/control/system/system.ts` | Server Action |
| 278 | CONTROL-SYSTEM | `rejectUpdate` | `name: string` | `./app/actions/handson/control/system/system.ts` | Server Action |
| 279 | CONTROL-SYSTEM | `saveConfigItem` | `item: ConfigItem` | `./app/actions/handson/control/system/master_config.ts` | Server Action |
| 280 | CONTROL-SYSTEM | `toggleBetaMode` | `` | `./app/actions/handson/control/system/global-settings.ts` | Server Action |
| 281 | CONTROL-SYSTEM | `toggleDebugMode` | `` | `./app/actions/handson/control/system/global-settings.ts` | Server Action |
| 282 | CONTROL-SYSTEM | `updateBrainSettings` | `name: string, data: any` | `./app/actions/handson/control/system/system.ts` | Server Action |
| 283 | CONTROL-SYSTEM | `updateWeatherSettings` | `name: string, data: any` | `./app/actions/handson/control/system/system.ts` | Server Action |
| 284 | CONTROL-TELEPHONY | `createAvailableDID` | `data: any` | `./app/actions/handson/control/telephony/telephony.ts` | Server Action |
| 285 | CONTROL-TELEPHONY | `createTelephonyCustomer` | `data: any` | `./app/actions/handson/control/telephony/telephony.ts` | Server Action |
| 286 | CONTROL-TELEPHONY | `createTelephonySubscription` | `data: any` | `./app/actions/handson/control/telephony/telephony.ts` | Server Action |
| 287 | CONTROL-TELEPHONY | `deleteAvailableDID` | `name: string` | `./app/actions/handson/control/telephony/telephony.ts` | Server Action |
| 288 | CONTROL-TELEPHONY | `deleteTelephonyCustomer` | `name: string` | `./app/actions/handson/control/telephony/telephony.ts` | Server Action |
| 289 | CONTROL-TELEPHONY | `deleteTelephonySubscription` | `name: string` | `./app/actions/handson/control/telephony/telephony.ts` | Server Action |
| 290 | CONTROL-TELEPHONY | `getAvailableDIDs` | `` | `./app/actions/handson/control/telephony/telephony.ts` | Server Action |
| 291 | CONTROL-TELEPHONY | `getTelephonyCustomers` | `` | `./app/actions/handson/control/telephony/telephony.ts` | Server Action |
| 292 | CONTROL-TELEPHONY | `getTelephonySettings` | `` | `./app/actions/handson/control/telephony/telephony.ts` | Server Action |
| 293 | CONTROL-TELEPHONY | `getTelephonySubscriptions` | `` | `./app/actions/handson/control/telephony/telephony.ts` | Server Action |
| 294 | CONTROL-TELEPHONY | `getTelephonyTransactions` | `` | `./app/actions/handson/control/telephony/telephony.ts` | Server Action |
| 295 | CONTROL-TELEPHONY | `updateAvailableDID` | `name: string, data: any` | `./app/actions/handson/control/telephony/telephony.ts` | Server Action |
| 296 | CONTROL-TELEPHONY | `updateTelephonyCustomer` | `name: string, data: any` | `./app/actions/handson/control/telephony/telephony.ts` | Server Action |
| 297 | CONTROL-TELEPHONY | `updateTelephonySettings` | `name: string, data: any` | `./app/actions/handson/control/telephony/telephony.ts` | Server Action |
| 298 | CONTROL-TELEPHONY | `updateTelephonySubscription` | `name: string, data: any` | `./app/actions/handson/control/telephony/telephony.ts` | Server Action |
| 299 | CONTROL-TENDER | `createGeneratedTenderTask` | `data: any` | `./app/actions/handson/control/tender/tender.ts` | Server Action |
| 300 | CONTROL-TENDER | `createIntelligentTaskSet` | `data: any` | `./app/actions/handson/control/tender/tender.ts` | Server Action |

## Documentation Parts
- **`endpoints_part1.md`**: 150 interactions (Nos. 1-150)
- **`endpoints_part2.md`**: 150 interactions (Nos. 151-300)
- **`endpoints_part3.md`**: 150 interactions (Nos. 301-450)
- **`endpoints_part4.md`**: 150 interactions (Nos. 451-600)
- **`endpoints_part5.md`**: 150 interactions (Nos. 601-750)
- **`endpoints_part6.md`**: 147 interactions (Nos. 751-897)