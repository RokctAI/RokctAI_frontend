# API Endpoints Detailed

Total Endpoints Found: 901
- Route Handlers: 13
- Server Actions: 888

## Route Handlers

| Path | Methods | File |
| :--- | :--- | :--- |
| `/api/ai/quota` | GET | `./app/api/ai/quota/route.ts` |
| `/api/ai/text` | POST | `./app/api/ai/text/route.ts` |
| `/api/auth/[...nextauth]` | GET, POST | `./app/(auth)/api/auth/[...nextauth]/route.ts` |
| `/api/chat` | DELETE, POST | `./app/(chat)/api/chat/route.ts` |
| `/api/files/upload` | POST | `./app/(chat)/api/files/upload/route.ts` |
| `/api/history` | GET | `./app/(chat)/api/history/route.ts` |
| `/api/history/clear` | POST | `./app/(chat)/api/history/clear/route.ts` |
| `/api/notes` | POST | `./app/api/notes/route.ts` |
| `/api/projects` | POST | `./app/api/projects/route.ts` |
| `/api/reminders/pending` | GET | `./app/(chat)/api/reminders/pending/route.ts` |
| `/api/reservation` | GET, PATCH | `./app/(chat)/api/reservation/route.ts` |
| `/api/tasks` | POST | `./app/api/tasks/route.ts` |
| `/api/webhooks/user-sync` | POST | `./app/api/webhooks/user-sync/route.ts` |

## Server Actions

| Function Name | Arguments | File |
| :--- | :--- | :--- |
| `generateReservationPrice` | `props: { seats: string[]; flightNumber: string; departure: { cityName: string; airportCode: string; timestamp: string; gate: string; terminal: string; }; arrival: { cityName: string; airportCode: string; timestamp: string; gate: string; terminal: string; }; passengerName: string; }` | `./ai/flights/actions.ts` |
| `generateSampleFlightSearchResults` | `{ origin, destination, }: { origin: string; destination: string; }` | `./ai/flights/actions.ts` |
| `generateSampleFlightStatus` | `{ flightNumber, date, }: { flightNumber: string; date: string; }` | `./ai/flights/actions.ts` |
| `generateSampleSeatSelection` | `{ flightNumber, }: { flightNumber: string; }` | `./ai/flights/actions.ts` |
| `getCurrentSession` | `` | `./app/(auth)/actions.ts` |
| `getIndustries` | `` | `./app/(auth)/actions.ts` |
| `login` | `prevState: ActionState, formData: FormData,` | `./app/(auth)/actions.ts` |
| `register` | `prevState: ActionState, formData: FormData,` | `./app/(auth)/actions.ts` |
| `countUsers` | `data: { modelId?: string } = {}` | `./app/actions/ai/admin.ts` |
| `getSystemHealth` | `data: { modelId?: string } = {}` | `./app/actions/ai/admin.ts` |
| `getUsers` | `data: { query?: string, modelId?: string } = {}` | `./app/actions/ai/admin.ts` |
| `analyzeAiCompetitor` | `data: { name: string; modelId?: string }` | `./app/actions/ai/competitor.ts` |
| `createAiCompetitor` | `data: { name: string; industry?: string; threat_level?: string; latitude?: number; longitude?: number; website?: string; modelId?: string }` | `./app/actions/ai/competitor.ts` |
| `getAiCompetitors` | `data: { modelId?: string } = {}` | `./app/actions/ai/competitor.ts` |
| `broadcastAnnouncement` | `data: { subject: string, message: string, modelId?: string }` | `./app/actions/ai/control.ts` |
| `getGlobalSettings` | `data: { modelId?: string } = {}` | `./app/actions/ai/control.ts` |
| `createAiNote` | `data: { title: string; description?: string; modelId?: string }` | `./app/actions/ai/create.ts` |
| `createAiProject` | `data: { name: string; description?: string; modelId?: string }` | `./app/actions/ai/create.ts` |
| `createAiTask` | `data: { name: string; priority?: string; end_date?: string; project?: string; assignee?: string; modelId?: string }` | `./app/actions/ai/create.ts` |
| `createAiLead` | `data: { lead_name: string; organization?: string; email_id?: string; mobile_no?: string; id_number?: string; modelId?: string }` | `./app/actions/ai/crm.ts` |
| `getCommunicationLogs` | `data: { query?: string, modelId?: string } = {}` | `./app/actions/ai/crm.ts` |
| `getCustomers` | `data: { query?: string; modelId?: string } = {}` | `./app/actions/ai/crm.ts` |
| `getMyDeals` | `data: { modelId?: string } = {}` | `./app/actions/ai/crm.ts` |
| `getMyLeads` | `data: { modelId?: string } = {}` | `./app/actions/ai/crm.ts` |
| `updateAiLead` | `data: { name: string; kyc_status?: "Pending" \| "Verified" \| "Rejected"; id_number?: string; modelId?: string }` | `./app/actions/ai/crm.ts` |
| `getPendingPayments` | `data: { modelId?: string } = {}` | `./app/actions/ai/financials.ts` |
| `getPurchaseInvoices` | `data: { modelId?: string } = {}` | `./app/actions/ai/financials.ts` |
| `getSalesInvoices` | `data: { modelId?: string } = {}` | `./app/actions/ai/financials.ts` |
| `announceHolidayWork` | `{ holiday, audience, departments }: HolidayWorkInput` | `./app/actions/ai/holiday.ts` |
| `checkUpcomingHoliday` | `` | `./app/actions/ai/holiday.ts` |
| `applyAiLeave` | `data: { leave_type: string; from_date: string; to_date: string; reason?: string; modelId?: string }` | `./app/actions/ai/hr.ts` |
| `checkHrRole` | `data: { modelId?: string } = {}` | `./app/actions/ai/hr.ts` |
| `createAiEmployeeAdvance` | `data: { amount: number; purpose: string; modelId?: string }` | `./app/actions/ai/hr.ts` |
| `createAiExpenseClaim` | `data: { description: string; amount: number; currency?: string; attachment_url?: string; modelId?: string }` | `./app/actions/ai/hr.ts` |
| `createAiGoal` | `data: { description: string; start_date?: string; end_date?: string; modelId?: string }` | `./app/actions/ai/hr.ts` |
| `createAssetRequest` | `data: { item_name: string; reason: string; modelId?: string }` | `./app/actions/ai/hr.ts` |
| `getAiExpenses` | `data: { modelId?: string } = {}` | `./app/actions/ai/hr.ts` |
| `getAiGoals` | `data: { modelId?: string } = {}` | `./app/actions/ai/hr.ts` |
| `getAiPayslips` | `data: { modelId?: string } = {}` | `./app/actions/ai/hr.ts` |
| `getAnnouncements` | `data: { modelId?: string } = {}` | `./app/actions/ai/hr.ts` |
| `getAssetItems` | `` | `./app/actions/ai/hr.ts` |
| `getAttendanceStatus` | `` | `./app/actions/ai/hr.ts` |
| `getLeaveBalance` | `data: { leave_type?: string; modelId?: string } = {}` | `./app/actions/ai/hr.ts` |
| `getLeaveStats` | `data: { modelId?: string } = {}` | `./app/actions/ai/hr.ts` |
| `getPendingApprovals` | `data: { modelId?: string } = {}` | `./app/actions/ai/hr.ts` |
| `markAiAttendance` | `data: { log_type?: "IN" \| "OUT"; timestamp?: string; latitude?: number; longitude?: number; modelId?: string }` | `./app/actions/ai/hr.ts` |
| `processApproval` | `data: { doctype: "Leave Application" \| "Expense Claim" \| "Material Request"; name: string; action: "Approve" \| "Reject"; comment?: string; modelId?: string }` | `./app/actions/ai/hr.ts` |
| `updateAiMyProfile` | `data: { first_name?: string; last_name?: string; id_number?: string; bank_name?: string; bank_account_no?: string; bank_branch_code?: string; tax_id?: string; modelId?: string }` | `./app/actions/ai/hr.ts` |
| `getMyEvents` | `data: { modelId?: string } = {}` | `./app/actions/ai/meetings.ts` |
| `createNotification` | `recipientEmail: string, subject: string, message: string, link?: string` | `./app/actions/ai/notifications.ts` |
| `notifyDecision` | `doctype: string, docname: string, status: "Approved" \| "Rejected"` | `./app/actions/ai/notifications.ts` |
| `completeOnboarding` | `` | `./app/actions/ai/onboarding.ts` |
| `saveOnboardingProgress` | `planData: Partial<StrategicPlan>` | `./app/actions/ai/onboarding.ts` |
| `syncOnboardingToSite` | `userEmail: string` | `./app/actions/ai/onboarding.ts` |
| `getJobApplicants` | `data: { modelId?: string } = {}` | `./app/actions/ai/recruitment.ts` |
| `getJobOpenings` | `data: { modelId?: string } = {}` | `./app/actions/ai/recruitment.ts` |
| `updateSmartStatus` | `{ query, status, document_type }: SmartActionInput` | `./app/actions/ai/smart_status.ts` |
| `getMyOkrs` | `data: { modelId?: string } = {}` | `./app/actions/ai/strategy.ts` |
| `checkStock` | `data: { itemQuery: string }` | `./app/actions/ai/supply_chain.ts` |
| `createAiPurchaseOrder` | `data: { supplier: string, items: { item: string, qty: number }[] }` | `./app/actions/ai/supply_chain.ts` |
| `createAiStockEntry` | `data: { source_warehouse: string, target_warehouse: string, items: { item: string, qty: number }[] }` | `./app/actions/ai/supply_chain.ts` |
| `getActiveQuotations` | `data: { modelId?: string } = {}` | `./app/actions/ai/supply_chain.ts` |
| `getPurchaseOrders` | `data: { modelId?: string } = {}` | `./app/actions/ai/supply_chain.ts` |
| `contactSupport` | `data: { subject: string, message: string, modelId?: string }` | `./app/actions/ai/tenant.ts` |
| `getBillingStatus` | `data: { modelId?: string } = {}` | `./app/actions/ai/tenant.ts` |
| `getMyProjects` | `data: { modelId?: string } = {}` | `./app/actions/ai/work.ts` |
| `getMyTasks` | `data: { modelId?: string } = {}` | `./app/actions/ai/work.ts` |
| `fetchBrandingData` | `` | `./app/actions/branding.ts` |
| `getSessionCompanyContext` | `` | `./app/actions/company.ts` |
| `getSessionCurrency` | `` | `./app/actions/currency.ts` |
| `createAssetCapitalization` | `data: { entry_type: string; target_asset?: string; posting_date: string; stock_items: { item_code: string; qty: number }[] }` | `./app/actions/handson/all/accounting/assets/capitalization/createAssetCapitalization.ts` |
| `getAssetCapitalizations` | `` | `./app/actions/handson/all/accounting/assets/capitalization/getAssetCapitalizations.ts` |
| `createAsset` | `data: AssetData` | `./app/actions/handson/all/accounting/assets/createAsset.ts` |
| `deleteAsset` | `name: string` | `./app/actions/handson/all/accounting/assets/deleteAsset.ts` |
| `getAssetDepreciationSchedules` | `` | `./app/actions/handson/all/accounting/assets/depreciation/getAssetDepreciationSchedules.ts` |
| `getAsset` | `name: string` | `./app/actions/handson/all/accounting/assets/getAsset.ts` |
| `getAssets` | `` | `./app/actions/handson/all/accounting/assets/getAssets.ts` |
| `createAssetMaintenance` | `data: AssetMaintenanceData` | `./app/actions/handson/all/accounting/assets/maintenance/createAssetMaintenance.ts` |
| `getAssetMaintenances` | `` | `./app/actions/handson/all/accounting/assets/maintenance/getAssetMaintenances.ts` |
| `createAssetMovement` | `data: { transaction_date: string; purpose: string; assets: { asset: string; target_location?: string }[] }` | `./app/actions/handson/all/accounting/assets/movement/createAssetMovement.ts` |
| `getAssetMovements` | `` | `./app/actions/handson/all/accounting/assets/movement/getAssetMovements.ts` |
| `createAssetRepair` | `data: { asset: string; failure_date: string; description: string; total_repair_cost: number }` | `./app/actions/handson/all/accounting/assets/repair/createAssetRepair.ts` |
| `getAssetRepairs` | `` | `./app/actions/handson/all/accounting/assets/repair/getAssetRepairs.ts` |
| `updateAsset` | `name: string, data: Partial<AssetData>` | `./app/actions/handson/all/accounting/assets/updateAsset.ts` |
| `createAssetValueAdjustment` | `data: AssetValueAdjustmentData` | `./app/actions/handson/all/accounting/assets/value_adjustment/createAssetValueAdjustment.ts` |
| `getAssetValueAdjustments` | `` | `./app/actions/handson/all/accounting/assets/value_adjustment/getAssetValueAdjustments.ts` |
| `createBudget` | `data: BudgetData` | `./app/actions/handson/all/accounting/budgets/createBudget.ts` |
| `getBudgets` | `` | `./app/actions/handson/all/accounting/budgets/getBudgets.ts` |
| `createBlanketOrder` | `data: { supplier: string; to_date: string; items: { item_code: string; qty: number; rate: number }[] }` | `./app/actions/handson/all/accounting/buying/order.ts` |
| `createPurchaseOrder` | `data: PurchaseOrderData` | `./app/actions/handson/all/accounting/buying/order.ts` |
| `deletePurchaseOrder` | `name: string` | `./app/actions/handson/all/accounting/buying/order.ts` |
| `getBlanketOrders` | `` | `./app/actions/handson/all/accounting/buying/order.ts` |
| `getPurchaseOrder` | `name: string` | `./app/actions/handson/all/accounting/buying/order.ts` |
| `getPurchaseOrders` | `` | `./app/actions/handson/all/accounting/buying/order.ts` |
| `updatePurchaseOrder` | `name: string, data: Partial<PurchaseOrderData>` | `./app/actions/handson/all/accounting/buying/order.ts` |
| `createQualityInspection` | `data: { inspection_type: string; reference_type: string; reference_name: string; status: string }` | `./app/actions/handson/all/accounting/buying/quality.ts` |
| `getQualityInspections` | `` | `./app/actions/handson/all/accounting/buying/quality.ts` |
| `createPurchaseReceipt` | `data: PurchaseReceiptData` | `./app/actions/handson/all/accounting/buying/receipt.ts` |
| `getPurchaseReceipts` | `` | `./app/actions/handson/all/accounting/buying/receipt.ts` |
| `createRFQ` | `data: { transaction_date: string; suppliers: { supplier: string }[]; items: { item_code: string; qty: number }[] }` | `./app/actions/handson/all/accounting/buying/rfq.ts` |
| `getRFQs` | `` | `./app/actions/handson/all/accounting/buying/rfq.ts` |
| `createSubcontractingOrder` | `data: SubcontractingOrderData` | `./app/actions/handson/all/accounting/buying/subcontracting.ts` |
| `createSubcontractingReceipt` | `data: SubcontractingReceiptData` | `./app/actions/handson/all/accounting/buying/subcontracting.ts` |
| `getSubcontractingOrders` | `` | `./app/actions/handson/all/accounting/buying/subcontracting.ts` |
| `getSubcontractingReceipts` | `` | `./app/actions/handson/all/accounting/buying/subcontracting.ts` |
| `createSupplier` | `data: SupplierData` | `./app/actions/handson/all/accounting/buying/supplier.ts` |
| `createSupplierQuotation` | `data: { supplier: string; items: { item_code: string; qty: number; rate: number }[] }` | `./app/actions/handson/all/accounting/buying/supplier.ts` |
| `getSupplierQuotations` | `` | `./app/actions/handson/all/accounting/buying/supplier.ts` |
| `getSupplierScorecards` | `` | `./app/actions/handson/all/accounting/buying/supplier.ts` |
| `getSuppliers` | `` | `./app/actions/handson/all/accounting/buying/supplier.ts` |
| `createCostCenter` | `data: CostCenterData` | `./app/actions/handson/all/accounting/cost_centers/createCostCenter.ts` |
| `getCostCenters` | `` | `./app/actions/handson/all/accounting/cost_centers/getCostCenters.ts` |
| `getBatches` | `` | `./app/actions/handson/all/accounting/inventory/batch_serial.ts` |
| `getSerialNos` | `` | `./app/actions/handson/all/accounting/inventory/batch_serial.ts` |
| `createItem` | `data: ItemData` | `./app/actions/handson/all/accounting/inventory/item.ts` |
| `deleteItem` | `item_code: string` | `./app/actions/handson/all/accounting/inventory/item.ts` |
| `getItem` | `item_code: string` | `./app/actions/handson/all/accounting/inventory/item.ts` |
| `getItems` | `` | `./app/actions/handson/all/accounting/inventory/item.ts` |
| `updateItem` | `item_code: string, data: Partial<ItemData>` | `./app/actions/handson/all/accounting/inventory/item.ts` |
| `createMaterialRequest` | `data: { transaction_date: string; material_request_type: string; items: { item_code: string; qty: number; schedule_date: string }[] }` | `./app/actions/handson/all/accounting/inventory/logistics.ts` |
| `createPickList` | `data: { purpose: string; locations: { item_code: string; qty: number; warehouse: string }[] }` | `./app/actions/handson/all/accounting/inventory/logistics.ts` |
| `createShipment` | `data: { delivery_from_type: string; delivery_from: string; carrier: string; tracking_number?: string }` | `./app/actions/handson/all/accounting/inventory/logistics.ts` |
| `getMaterialRequests` | `` | `./app/actions/handson/all/accounting/inventory/logistics.ts` |
| `getPickLists` | `` | `./app/actions/handson/all/accounting/inventory/logistics.ts` |
| `getShipments` | `` | `./app/actions/handson/all/accounting/inventory/logistics.ts` |
| `createLandedCostVoucher` | `data: { company: string; receipt_document_type: string; receipt_document: string; taxes: { account: string; amount: number }[] }` | `./app/actions/handson/all/accounting/inventory/stock.ts` |
| `createStockEntry` | `data: any` | `./app/actions/handson/all/accounting/inventory/stock.ts` |
| `createStockReconciliation` | `data: { company: string; posting_date: string; items: { item_code: string; qty: number; warehouse: string; valuation_rate: number }[] }` | `./app/actions/handson/all/accounting/inventory/stock.ts` |
| `getLandedCostVouchers` | `` | `./app/actions/handson/all/accounting/inventory/stock.ts` |
| `getStockLedgerEntries` | `` | `./app/actions/handson/all/accounting/inventory/stock.ts` |
| `getStockReconciliations` | `` | `./app/actions/handson/all/accounting/inventory/stock.ts` |
| `getWarehouses` | `` | `./app/actions/handson/all/accounting/inventory/stock.ts` |
| `createInvoice` | `data: InvoiceData` | `./app/actions/handson/all/accounting/invoices/createInvoice.ts` |
| `deleteInvoice` | `name: string` | `./app/actions/handson/all/accounting/invoices/deleteInvoice.ts` |
| `getInvoice` | `name: string` | `./app/actions/handson/all/accounting/invoices/getInvoice.ts` |
| `getSalesInvoices` | `` | `./app/actions/handson/all/accounting/invoices/getSalesInvoices.ts` |
| `updateInvoice` | `name: string, data: Partial<InvoiceData>` | `./app/actions/handson/all/accounting/invoices/updateInvoice.ts` |
| `createJournalEntry` | `data: JournalEntryData` | `./app/actions/handson/all/accounting/journals/createJournalEntry.ts` |
| `getGLEntries` | `filters?: any` | `./app/actions/handson/all/accounting/journals/getGLEntries.ts` |
| `getJournalEntries` | `` | `./app/actions/handson/all/accounting/journals/getJournalEntries.ts` |
| `createBOM` | `item: string, quantity: number, items: { item_code: string; qty: number }[]` | `./app/actions/handson/all/accounting/manufacturing/bom.ts` |
| `deleteBOM` | `name: string` | `./app/actions/handson/all/accounting/manufacturing/bom.ts` |
| `getBOM` | `name: string` | `./app/actions/handson/all/accounting/manufacturing/bom.ts` |
| `getBOMs` | `` | `./app/actions/handson/all/accounting/manufacturing/bom.ts` |
| `createProductionPlan` | `data: ProductionPlanData` | `./app/actions/handson/all/accounting/manufacturing/production_plan.ts` |
| `getProductionPlans` | `` | `./app/actions/handson/all/accounting/manufacturing/production_plan.ts` |
| `createRouting` | `data: { routing_name: string; operations: { operation: string; workstation: string; time_in_mins: number }[] }` | `./app/actions/handson/all/accounting/manufacturing/routing.ts` |
| `getRoutings` | `` | `./app/actions/handson/all/accounting/manufacturing/routing.ts` |
| `createShopFloorItem` | `data: ShopFloorData` | `./app/actions/handson/all/accounting/manufacturing/shop_floor.ts` |
| `getShopFloorItems` | `doctype: string` | `./app/actions/handson/all/accounting/manufacturing/shop_floor.ts` |
| `createWorkOrder` | `data: { production_item: string; qty: number; company: string; plan_start_date: string }` | `./app/actions/handson/all/accounting/manufacturing/work_order.ts` |
| `getWorkOrder` | `id: string` | `./app/actions/handson/all/accounting/manufacturing/work_order.ts` |
| `getWorkOrders` | `` | `./app/actions/handson/all/accounting/manufacturing/work_order.ts` |
| `cancelPayment` | `name: string` | `./app/actions/handson/all/accounting/payments/cancelPayment.ts` |
| `createPayment` | `data: PaymentData` | `./app/actions/handson/all/accounting/payments/createPayment.ts` |
| `getPayment` | `name: string` | `./app/actions/handson/all/accounting/payments/getPayment.ts` |
| `getPayments` | `` | `./app/actions/handson/all/accounting/payments/getPayments.ts` |
| `updateClearanceDate` | `doctype: "Payment Entry" \| "Journal Entry", name: string, date: string` | `./app/actions/handson/all/accounting/payments/updateClearanceDate.ts` |
| `createPurchaseInvoice` | `data: PurchaseInvoiceData` | `./app/actions/handson/all/accounting/purchases/createPurchaseInvoice.ts` |
| `deletePurchaseInvoice` | `name: string` | `./app/actions/handson/all/accounting/purchases/deletePurchaseInvoice.ts` |
| `getPurchaseInvoices` | `` | `./app/actions/handson/all/accounting/purchases/getPurchaseInvoices.ts` |
| `createDeliveryNote` | `data: DeliveryNoteData` | `./app/actions/handson/all/accounting/selling/delivery_note.ts` |
| `getDeliveryNote` | `name: string` | `./app/actions/handson/all/accounting/selling/delivery_note.ts` |
| `getDeliveryNotes` | `` | `./app/actions/handson/all/accounting/selling/delivery_note.ts` |
| `createProductBundle` | `data: { new_item_code: string; items: { item_code: string; qty: number }[] }` | `./app/actions/handson/all/accounting/selling/extras.ts` |
| `createSalesPartner` | `data: { partner_name: string; commission_rate: number; partner_type?: string }` | `./app/actions/handson/all/accounting/selling/extras.ts` |
| `createShippingRule` | `data: { label: string; calculate_based_on: string; shipping_amount?: number }` | `./app/actions/handson/all/accounting/selling/extras.ts` |
| `getProductBundles` | `` | `./app/actions/handson/all/accounting/selling/extras.ts` |
| `getSalesPartners` | `` | `./app/actions/handson/all/accounting/selling/extras.ts` |
| `getShippingRules` | `` | `./app/actions/handson/all/accounting/selling/extras.ts` |
| `createQuotation` | `data: QuotationData` | `./app/actions/handson/all/accounting/selling/quotation.ts` |
| `deleteQuotation` | `name: string` | `./app/actions/handson/all/accounting/selling/quotation.ts` |
| `getActiveQuotations` | `` | `./app/actions/handson/all/accounting/selling/quotation.ts` |
| `getQuotation` | `name: string` | `./app/actions/handson/all/accounting/selling/quotation.ts` |
| `getQuotations` | `` | `./app/actions/handson/all/accounting/selling/quotation.ts` |
| `updateQuotation` | `name: string, data: Partial<QuotationData>` | `./app/actions/handson/all/accounting/selling/quotation.ts` |
| `createSalesOrder` | `data: any` | `./app/actions/handson/all/accounting/selling/sales_order.ts` |
| `getCustomers` | `` | `./app/actions/handson/all/accounting/selling/sales_order.ts` |
| `getSalesOrder` | `name: string` | `./app/actions/handson/all/accounting/selling/sales_order.ts` |
| `getSalesOrders` | `` | `./app/actions/handson/all/accounting/selling/sales_order.ts` |
| `getCallLogs` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/call_logs.ts` |
| `createEmailCampaign` | `data: EmailCampaignData` | `./app/actions/handson/all/crm/campaigns.ts` |
| `getEmailCampaigns` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/campaigns.ts` |
| `createCompetitor` | `data: any` | `./app/actions/handson/all/crm/competitor.ts` |
| `createCompetitorRoute` | `data: any` | `./app/actions/handson/all/crm/competitor.ts` |
| `createCompetitorZone` | `data: any` | `./app/actions/handson/all/crm/competitor.ts` |
| `createIndustry` | `data: any` | `./app/actions/handson/all/crm/competitor.ts` |
| `deleteCompetitor` | `name: string` | `./app/actions/handson/all/crm/competitor.ts` |
| `deleteCompetitorRoute` | `name: string` | `./app/actions/handson/all/crm/competitor.ts` |
| `deleteCompetitorZone` | `name: string` | `./app/actions/handson/all/crm/competitor.ts` |
| `getCompetitor` | `name: string` | `./app/actions/handson/all/crm/competitor.ts` |
| `getCompetitorProducts` | `competitorName?: string` | `./app/actions/handson/all/crm/competitor.ts` |
| `getCompetitorRoutes` | `` | `./app/actions/handson/all/crm/competitor.ts` |
| `getCompetitorZones` | `` | `./app/actions/handson/all/crm/competitor.ts` |
| `getCompetitors` | `` | `./app/actions/handson/all/crm/competitor.ts` |
| `getIndustries` | `` | `./app/actions/handson/all/crm/competitor.ts` |
| `getLocationTypes` | `` | `./app/actions/handson/all/crm/competitor.ts` |
| `getOrgansOfState` | `` | `./app/actions/handson/all/crm/competitor.ts` |
| `updateCompetitor` | `name: string, data: any` | `./app/actions/handson/all/crm/competitor.ts` |
| `getContact` | `id: string` | `./app/actions/handson/all/crm/contacts.ts` |
| `getContacts` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/contacts.ts` |
| `createContract` | `data: ContractData` | `./app/actions/handson/all/crm/contracts.ts` |
| `getContract` | `id: string` | `./app/actions/handson/all/crm/contracts.ts` |
| `getContracts` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/contracts.ts` |
| `saveDoc` | `doctype: string, data: any, path_to_revalidate?: string` | `./app/actions/handson/all/crm/crud.ts` |
| `getDashboardStats` | `fromDate?: string, toDate?: string` | `./app/actions/handson/all/crm/dashboard.ts` |
| `createOpportunity` | `data: OpportunityData` | `./app/actions/handson/all/crm/deals.ts` |
| `deleteOpportunity` | `name: string` | `./app/actions/handson/all/crm/deals.ts` |
| `getDeal` | `id: string` | `./app/actions/handson/all/crm/deals.ts` |
| `getDeals` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/deals.ts` |
| `getOpportunities` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/deals.ts` |
| `getOpportunity` | `id: string` | `./app/actions/handson/all/crm/deals.ts` |
| `updateOpportunity` | `name: string, data: Partial<OpportunityData>` | `./app/actions/handson/all/crm/deals.ts` |
| `createLead` | `data: LeadData` | `./app/actions/handson/all/crm/leads.ts` |
| `deleteLead` | `name: string` | `./app/actions/handson/all/crm/leads.ts` |
| `getLead` | `id: string` | `./app/actions/handson/all/crm/leads.ts` |
| `getLeads` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/leads.ts` |
| `updateLead` | `name: string, data: Partial<LeadData>` | `./app/actions/handson/all/crm/leads.ts` |
| `createGrievance` | `data: any` | `./app/actions/handson/all/crm/lifecycle.ts` |
| `createPolicy` | `data: any` | `./app/actions/handson/all/crm/lifecycle.ts` |
| `createWarning` | `data: any` | `./app/actions/handson/all/crm/lifecycle.ts` |
| `getGrievanceTypes` | `` | `./app/actions/handson/all/crm/lifecycle.ts` |
| `getGrievances` | `` | `./app/actions/handson/all/crm/lifecycle.ts` |
| `getPolicies` | `` | `./app/actions/handson/all/crm/lifecycle.ts` |
| `getPolicy` | `name: string` | `./app/actions/handson/all/crm/lifecycle.ts` |
| `getWarnings` | `` | `./app/actions/handson/all/crm/lifecycle.ts` |
| `updateGrievance` | `name: string, data: any` | `./app/actions/handson/all/crm/lifecycle.ts` |
| `getDocTypeMeta` | `doctype: string` | `./app/actions/handson/all/crm/meta.ts` |
| `getNotes` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/notes.ts` |
| `getOrganization` | `id: string` | `./app/actions/handson/all/crm/organizations.ts` |
| `getOrganizations` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/organizations.ts` |
| `createProspect` | `data: ProspectData` | `./app/actions/handson/all/crm/prospects.ts` |
| `deleteProspect` | `name: string` | `./app/actions/handson/all/crm/prospects.ts` |
| `getProspect` | `id: string` | `./app/actions/handson/all/crm/prospects.ts` |
| `getProspects` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/prospects.ts` |
| `updateProspect` | `name: string, data: Partial<ProspectData>` | `./app/actions/handson/all/crm/prospects.ts` |
| `createSubscription` | `data: { party_type: string; party: string; plans: { plan: string; qty: number }[] }` | `./app/actions/handson/all/crm/subscriptions.ts` |
| `createSubscriptionPlan` | `data: { plan_name: string; currency: string; cost: number; billing_interval: "Month" \| "Year" }` | `./app/actions/handson/all/crm/subscriptions.ts` |
| `getSubscriptionPlans` | `` | `./app/actions/handson/all/crm/subscriptions.ts` |
| `getSubscriptions` | `` | `./app/actions/handson/all/crm/subscriptions.ts` |
| `createIssue` | `data: IssueData` | `./app/actions/handson/all/crm/support/issue.ts` |
| `getIssue` | `name: string` | `./app/actions/handson/all/crm/support/issue.ts` |
| `getIssues` | `` | `./app/actions/handson/all/crm/support/issue.ts` |
| `updateIssue` | `name: string, data: Partial<IssueData>` | `./app/actions/handson/all/crm/support/issue.ts` |
| `createNote` | `data: any` | `./app/actions/handson/all/crm/support/note.ts` |
| `getNotes` | `` | `./app/actions/handson/all/crm/support/note.ts` |
| `createServiceLevelAgreement` | `data: SLAData` | `./app/actions/handson/all/crm/support/sla.ts` |
| `getServiceLevelAgreements` | `` | `./app/actions/handson/all/crm/support/sla.ts` |
| `createWarrantyClaim` | `data: { customer: string; item_code: string; issue_date: string; description: string }` | `./app/actions/handson/all/crm/support/warranty.ts` |
| `getWarrantyClaims` | `` | `./app/actions/handson/all/crm/support/warranty.ts` |
| `getTasks` | `page = 1, limit = 20` | `./app/actions/handson/all/crm/tasks.ts` |
| `getTimeline` | `doctype: string, docname: string` | `./app/actions/handson/all/crm/timeline.ts` |
| `createEmployeeAdvance` | `data: EmployeeAdvanceData` | `./app/actions/handson/all/hrms/advances.ts` |
| `getEmployeeAdvances` | `` | `./app/actions/handson/all/hrms/advances.ts` |
| `checkIn` | `data: { employee: string, company: string, timestamp: string }` | `./app/actions/handson/all/hrms/attendance.ts` |
| `checkOut` | `data: { employee: string, timestamp: string }` | `./app/actions/handson/all/hrms/attendance.ts` |
| `getAttendanceList` | `` | `./app/actions/handson/all/hrms/attendance.ts` |
| `getTodayAttendance` | `employee: string` | `./app/actions/handson/all/hrms/attendance.ts` |
| `getCompanies` | `` | `./app/actions/handson/all/hrms/companies.ts` |
| `getPendingApprovals` | `` | `./app/actions/handson/all/hrms/dashboard.ts` |
| `createDepartment` | `data: DepartmentData` | `./app/actions/handson/all/hrms/departments.ts` |
| `getDepartments` | `` | `./app/actions/handson/all/hrms/departments.ts` |
| `createDesignation` | `data: DesignationData` | `./app/actions/handson/all/hrms/designations.ts` |
| `getDesignations` | `` | `./app/actions/handson/all/hrms/designations.ts` |
| `createEmployee` | `data: EmployeeData` | `./app/actions/handson/all/hrms/employees.ts` |
| `getEmployee` | `name: string` | `./app/actions/handson/all/hrms/employees.ts` |
| `getEmployees` | `` | `./app/actions/handson/all/hrms/employees.ts` |
| `updateEmployee` | `name: string, data: Partial<EmployeeData>` | `./app/actions/handson/all/hrms/employees.ts` |
| `createExpenseClaim` | `data: ExpenseClaimData` | `./app/actions/handson/all/hrms/expenses.ts` |
| `getExpenseClaimTypes` | `` | `./app/actions/handson/all/hrms/expenses.ts` |
| `getExpenseClaims` | `` | `./app/actions/handson/all/hrms/expenses.ts` |
| `createLeaveApplication` | `data: any` | `./app/actions/handson/all/hrms/leave.ts` |
| `getHolidays` | `year?: string` | `./app/actions/handson/all/hrms/leave.ts` |
| `getLeaveAllocations` | `employee: string` | `./app/actions/handson/all/hrms/leave.ts` |
| `getLeaveApplications` | `` | `./app/actions/handson/all/hrms/leave.ts` |
| `getLeaveTypes` | `` | `./app/actions/handson/all/hrms/leave.ts` |
| `createLoan` | `data: any` | `./app/actions/handson/all/hrms/loans.ts` |
| `getLoans` | `` | `./app/actions/handson/all/hrms/loans.ts` |
| `getMyAttendanceList` | `` | `./app/actions/handson/all/hrms/me/attendance.ts` |
| `markMyAttendance` | `data: AttendanceData` | `./app/actions/handson/all/hrms/me/attendance.ts` |
| `getMyProfile` | `` | `./app/actions/handson/all/hrms/me/employees.ts` |
| `updateMyProfile` | `data: Partial<EmployeeProfileData>` | `./app/actions/handson/all/hrms/me/employees.ts` |
| `createMyExpenseClaim` | `data: ExpenseClaimData` | `./app/actions/handson/all/hrms/me/expenses.ts` |
| `getMyExpenseClaims` | `` | `./app/actions/handson/all/hrms/me/expenses.ts` |
| `createMyLeaveApplication` | `data: LeaveApplicationData` | `./app/actions/handson/all/hrms/me/leave.ts` |
| `getMyLeaveApplications` | `` | `./app/actions/handson/all/hrms/me/leave.ts` |
| `getAppraisals` | `` | `./app/actions/handson/all/hrms/me/performance.ts` |
| `getGoals` | `` | `./app/actions/handson/all/hrms/me/performance.ts` |
| `saveGoal` | `data: any` | `./app/actions/handson/all/hrms/me/performance.ts` |
| `submitAppraisal` | `data: any` | `./app/actions/handson/all/hrms/me/performance.ts` |
| `createSalarySlip` | `data: any` | `./app/actions/handson/all/hrms/payroll.ts` |
| `getSalarySlip` | `name: string` | `./app/actions/handson/all/hrms/payroll.ts` |
| `getSalarySlips` | `` | `./app/actions/handson/all/hrms/payroll.ts` |
| `getSalaryStructures` | `` | `./app/actions/handson/all/hrms/payroll.ts` |
| `createAppraisal` | `data: any` | `./app/actions/handson/all/hrms/performance.ts` |
| `createGoal` | `data: any` | `./app/actions/handson/all/hrms/performance.ts` |
| `getAllAppraisals` | `` | `./app/actions/handson/all/hrms/performance.ts` |
| `getAllGoals` | `` | `./app/actions/handson/all/hrms/performance.ts` |
| `updateGoal` | `name: string, data: any` | `./app/actions/handson/all/hrms/performance.ts` |
| `createPromotion` | `data: PromotionData` | `./app/actions/handson/all/hrms/promotions.ts` |
| `getPromotions` | `` | `./app/actions/handson/all/hrms/promotions.ts` |
| `createJobApplicant` | `data: JobApplicantData` | `./app/actions/handson/all/hrms/recruitment.ts` |
| `createJobOpening` | `data: JobOpeningData` | `./app/actions/handson/all/hrms/recruitment.ts` |
| `getJobApplicants` | `` | `./app/actions/handson/all/hrms/recruitment.ts` |
| `getJobOpening` | `name: string` | `./app/actions/handson/all/hrms/recruitment.ts` |
| `getJobOpenings` | `` | `./app/actions/handson/all/hrms/recruitment.ts` |
| `createSeparation` | `data: any` | `./app/actions/handson/all/hrms/separations.ts` |
| `getSeparations` | `` | `./app/actions/handson/all/hrms/separations.ts` |
| `createShiftAssignment` | `data: ShiftAssignmentData` | `./app/actions/handson/all/hrms/shifts.ts` |
| `getShiftAssignments` | `` | `./app/actions/handson/all/hrms/shifts.ts` |
| `getShiftTypes` | `` | `./app/actions/handson/all/hrms/shifts.ts` |
| `createTravelRequest` | `data: any` | `./app/actions/handson/all/hrms/travel.ts` |
| `getTravelRequests` | `` | `./app/actions/handson/all/hrms/travel.ts` |
| `createLoanApplication` | `data: LoanApplicationData` | `./app/actions/handson/all/lending/application.ts` |
| `getLoanApplication` | `id: string` | `./app/actions/handson/all/lending/application.ts` |
| `getLoanApplications` | `page = 1, limit = 20` | `./app/actions/handson/all/lending/application.ts` |
| `updateLoanApplication` | `name: string, data: Partial<LoanApplicationData>` | `./app/actions/handson/all/lending/application.ts` |
| `runDecisionEngine` | `applicationId: string` | `./app/actions/handson/all/lending/decision_engine.ts` |
| `createLoanDemand` | `data: { loan: string; demand_type: "Penalty" \| "Charges"; amount: number; date: string; description?: string; // Mapped to demand_subtype usually or remarks }` | `./app/actions/handson/all/lending/demand.ts` |
| `createBalanceAdjustment` | `data: { loan: string; amount: number; type: "Debit Adjustment" \| "Credit Adjustment"; remarks?: string }` | `./app/actions/handson/all/lending/lifecycle.ts` |
| `createLoanRestructure` | `data: { loan: string; date: string; reason?: string; // Simple restructure params (usually just modifying terms` | `./app/actions/handson/all/lending/lifecycle.ts` |
| `createLoanWriteOff` | `loan: string, amount: number` | `./app/actions/handson/all/lending/lifecycle.ts` |
| `disburseLoan` | `{ loanId, postingDate }: { loanId: string, postingDate?: string }` | `./app/actions/handson/all/lending/loan.ts` |
| `getAssetAccounts` | `company: string` | `./app/actions/handson/all/lending/loan.ts` |
| `getLoan` | `id: string` | `./app/actions/handson/all/lending/loan.ts` |
| `getLoanRepaymentSchedule` | `loanId: string` | `./app/actions/handson/all/lending/loan.ts` |
| `getLoanTimeline` | `loanId: string` | `./app/actions/handson/all/lending/loan.ts` |
| `getLoans` | `page = 1, limit = 20, filters: any = {}` | `./app/actions/handson/all/lending/loan.ts` |
| `realisePawnAsset` | `{ loan, asset_account }: { loan: string, asset_account: string }` | `./app/actions/handson/all/lending/loan.ts` |
| `releaseSecurity` | `{ loanId }: { loanId: string }` | `./app/actions/handson/all/lending/loan.ts` |
| `getNCRForm40Data` | `filters: any = {}` | `./app/actions/handson/all/lending/ncr_reports.ts` |
| `getProcessLogs` | `limit = 10` | `./app/actions/handson/all/lending/operations.ts` |
| `triggerLoanClassification` | `` | `./app/actions/handson/all/lending/operations.ts` |
| `triggerLoanInterestAccrual` | `postingDate?: string` | `./app/actions/handson/all/lending/operations.ts` |
| `triggerLoanSecurityShortfall` | `` | `./app/actions/handson/all/lending/operations.ts` |
| `getLoanProduct` | `name: string` | `./app/actions/handson/all/lending/product.ts` |
| `getLoanProducts` | `` | `./app/actions/handson/all/lending/product.ts` |
| `createLoanRefund` | `data: { loan: string; amount: number; type: "Excess" \| "Security" }` | `./app/actions/handson/all/lending/refund.ts` |
| `createLoanRepayment` | `data: RepaymentData` | `./app/actions/handson/all/lending/repayment.ts` |
| `getLoanRepayments` | `page = 1, limit = 20` | `./app/actions/handson/all/lending/repayment.ts` |
| `getLendingReport` | `reportName: string, filters: any = {}` | `./app/actions/handson/all/lending/reports.ts` |
| `createDefaultPawnProduct` | `` | `./app/actions/handson/all/lending/seed_product.ts` |
| `createDefaultShortTermProduct` | `` | `./app/actions/handson/all/lending/seed_product.ts` |
| `createDefaultUnsecuredProduct` | `` | `./app/actions/handson/all/lending/seed_product.ts` |
| `createLoanTransfer` | `data: { transfer_date: string; from_branch: string; to_branch: string; loans: string[]; // List of Loan IDs company: string; applicant?: string; }` | `./app/actions/handson/all/lending/transfer.ts` |
| `getBranches` | `` | `./app/actions/handson/all/lending/transfer.ts` |
| `getLoansByBranch` | `branch: string, applicant?: string` | `./app/actions/handson/all/lending/transfer.ts` |
| `fetchAssignment` | `assignmentName: string` | `./app/actions/handson/all/lms/assignments/actions.ts` |
| `fetchMySubmission` | `assignmentName: string` | `./app/actions/handson/all/lms/assignments/actions.ts` |
| `submitAssignmentAction` | `assignmentName: string, data: { answer?: string, attachment?: string, submissionName?: string }` | `./app/actions/handson/all/lms/assignments/actions.ts` |
| `fetchMyBatches` | `` | `./app/actions/handson/all/lms/batches/actions.ts` |
| `fetchCourseByName` | `courseName: string` | `./app/actions/handson/all/lms/courses/actions.ts` |
| `fetchCourses` | `` | `./app/actions/handson/all/lms/courses/actions.ts` |
| `fetchLesson` | `courseName: string, lesson: string, chapter?: string` | `./app/actions/handson/all/lms/courses/actions.ts` |
| `fetchMyCourses` | `` | `./app/actions/handson/all/lms/courses/actions.ts` |
| `saveLessonProgress` | `courseName: string, lessonName: string` | `./app/actions/handson/all/lms/courses/actions.ts` |
| `createDiscussionReplyAction` | `topic: string, reply: string, path?: string` | `./app/actions/handson/all/lms/discussions/actions.ts` |
| `createDiscussionTopicAction` | `doctype: string, docname: string, title: string` | `./app/actions/handson/all/lms/discussions/actions.ts` |
| `fetchDiscussionReplies` | `topic: string` | `./app/actions/handson/all/lms/discussions/actions.ts` |
| `fetchDiscussionTopics` | `doctype: string, docname: string` | `./app/actions/handson/all/lms/discussions/actions.ts` |
| `fetchMyLiveClasses` | `` | `./app/actions/handson/all/lms/events/actions.ts` |
| `fetchUpcomingEvaluations` | `` | `./app/actions/handson/all/lms/events/actions.ts` |
| `fetchJob` | `jobName: string` | `./app/actions/handson/all/lms/jobs/actions.ts` |
| `fetchJobs` | `` | `./app/actions/handson/all/lms/jobs/actions.ts` |
| `checkAnswer` | `questionName: string, type: string, answers: any[]` | `./app/actions/handson/all/lms/quiz/actions.ts` |
| `fetchQuestionDetails` | `questionName: string` | `./app/actions/handson/all/lms/quiz/actions.ts` |
| `fetchQuiz` | `quizName: string` | `./app/actions/handson/all/lms/quiz/actions.ts` |
| `fetchQuizAttempts` | `quizName: string` | `./app/actions/handson/all/lms/quiz/actions.ts` |
| `fetchQuizSummary` | `quizName: string` | `./app/actions/handson/all/lms/quiz/actions.ts` |
| `checkReviewStatus` | `courseName: string, user: string` | `./app/actions/handson/all/lms/reviews/actions.ts` |
| `createReviewAction` | `courseName: string, rating: number, reviewText: string` | `./app/actions/handson/all/lms/reviews/actions.ts` |
| `fetchCourseReviews` | `courseName: string` | `./app/actions/handson/all/lms/reviews/actions.ts` |
| `fetchCertificates` | `` | `./app/actions/handson/all/lms/user/actions.ts` |
| `fetchProfile` | `` | `./app/actions/handson/all/lms/user/actions.ts` |
| `fetchStreakInfo` | `` | `./app/actions/handson/all/lms/user/actions.ts` |
| `fetchUserInfo` | `` | `./app/actions/handson/all/lms/user/actions.ts` |
| `updateProfileAction` | `data: any` | `./app/actions/handson/all/lms/user/actions.ts` |
| `cloneProject` | `projectId: string, newName: string` | `./app/actions/handson/all/projects/cloning.ts` |
| `getMyTasks` | `` | `./app/actions/handson/all/projects/me/tasks.ts` |
| `createMyTimesheet` | `data: any` | `./app/actions/handson/all/projects/me/timesheets.ts` |
| `getMyTimesheets` | `` | `./app/actions/handson/all/projects/me/timesheets.ts` |
| `createProject` | `data: ProjectData` | `./app/actions/handson/all/projects/projects.ts` |
| `deleteProject` | `name: string` | `./app/actions/handson/all/projects/projects.ts` |
| `getProject` | `name: string` | `./app/actions/handson/all/projects/projects.ts` |
| `getProjects` | `` | `./app/actions/handson/all/projects/projects.ts` |
| `updateProject` | `name: string, data: Partial<ProjectData>` | `./app/actions/handson/all/projects/projects.ts` |
| `createKPI` | `data: any` | `./app/actions/handson/all/projects/strategy/kpi.ts` |
| `deleteKPI` | `name: string` | `./app/actions/handson/all/projects/strategy/kpi.ts` |
| `getKPIs` | `objectiveName?: string` | `./app/actions/handson/all/projects/strategy/kpi.ts` |
| `updateKPI` | `name: string, data: any` | `./app/actions/handson/all/projects/strategy/kpi.ts` |
| `createPersonalMasteryGoal` | `data: any` | `./app/actions/handson/all/projects/strategy/mastery.ts` |
| `deletePersonalMasteryGoal` | `name: string` | `./app/actions/handson/all/projects/strategy/mastery.ts` |
| `getPersonalMasteryGoals` | `` | `./app/actions/handson/all/projects/strategy/mastery.ts` |
| `updatePersonalMasteryGoal` | `name: string, data: any` | `./app/actions/handson/all/projects/strategy/mastery.ts` |
| `createStrategicObjective` | `data: any` | `./app/actions/handson/all/projects/strategy/objective.ts` |
| `deleteStrategicObjective` | `name: string` | `./app/actions/handson/all/projects/strategy/objective.ts` |
| `getStrategicObjectives` | `pillarName?: string` | `./app/actions/handson/all/projects/strategy/objective.ts` |
| `updateStrategicObjective` | `name: string, data: any` | `./app/actions/handson/all/projects/strategy/objective.ts` |
| `createPillar` | `data: any` | `./app/actions/handson/all/projects/strategy/pillar.ts` |
| `deletePillar` | `name: string` | `./app/actions/handson/all/projects/strategy/pillar.ts` |
| `getPillars` | `visionName?: string` | `./app/actions/handson/all/projects/strategy/pillar.ts` |
| `updatePillar` | `name: string, data: any` | `./app/actions/handson/all/projects/strategy/pillar.ts` |
| `getPlanOnAPage` | `` | `./app/actions/handson/all/projects/strategy/plan.ts` |
| `updatePlanOnAPage` | `data: any` | `./app/actions/handson/all/projects/strategy/plan.ts` |
| `createVision` | `data: any` | `./app/actions/handson/all/projects/strategy/vision.ts` |
| `deleteVision` | `name: string` | `./app/actions/handson/all/projects/strategy/vision.ts` |
| `getVision` | `name: string` | `./app/actions/handson/all/projects/strategy/vision.ts` |
| `getVisions` | `` | `./app/actions/handson/all/projects/strategy/vision.ts` |
| `updateVision` | `name: string, data: any` | `./app/actions/handson/all/projects/strategy/vision.ts` |
| `createTask` | `data: any` | `./app/actions/handson/all/projects/tasks.ts` |
| `getTasks` | `` | `./app/actions/handson/all/projects/tasks.ts` |
| `getUsers` | `` | `./app/actions/handson/all/projects/tasks.ts` |
| `createActivityType` | `data: any` | `./app/actions/handson/all/projects/timesheets.ts` |
| `createTimesheet` | `data: any` | `./app/actions/handson/all/projects/timesheets.ts` |
| `getActivityTypes` | `` | `./app/actions/handson/all/projects/timesheets.ts` |
| `getTimesheets` | `` | `./app/actions/handson/all/projects/timesheets.ts` |
| `executeReportQuery` | `sql: string` | `./app/actions/handson/all/reports/analytics.ts` |
| `getStandardReports` | `` | `./app/actions/handson/all/reports/analytics.ts` |
| `runCustomReport` | `doctype: string, fields: string[], filters: any = {}` | `./app/actions/handson/all/reports/analytics.ts` |
| `getAccountBalances` | `company: string` | `./app/actions/handson/all/reports/financial.ts` |
| `runFinancialReport` | `reportName: string, filters: any` | `./app/actions/handson/all/reports/financial.ts` |
| `assignToJules` | `docname: string, feature: string, explanation: string` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `createRoadmap` | `data: any` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `createRoadmapFeature` | `data: any` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `deleteRoadmap` | `name: string` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `deleteRoadmapFeature` | `name: string` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `discoverRoadmapContext` | `name: string` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `generateOneRoadmapIdeas` | `name: string` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `getGlobalSettings` | `` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `getJulesActivities` | `sessionId: string, apiKey?: string` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `getJulesSources` | `apiKey?: string` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `getJulesStatus` | `sessionId: string, apiKey?: string` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `getRoadmap` | `name: string` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `getRoadmapFeatures` | `roadmapName: string` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `getRoadmaps` | `` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `sendJulesMessage` | `sessionId: string, message: string, apiKey?: string` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `setPublicRoadmap` | `roadmapName: string \| null` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `triggerJules` | `` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `updateRoadmap` | `name: string, data: any` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `updateRoadmapFeature` | `name: string, data: any` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `voteOnPlan` | `sessionId: string, action: "approve", apiKey?: string` | `./app/actions/handson/all/roadmap/roadmap.ts` |
| `getCompanyDetails` | `` | `./app/actions/handson/all/settings/general.ts` |
| `getSystemSettings` | `` | `./app/actions/handson/all/settings/general.ts` |
| `updateCompanyDetails` | `name: string, data: any` | `./app/actions/handson/all/settings/general.ts` |
| `updateNamingSeries` | `series: string, current: number` | `./app/actions/handson/all/settings/general.ts` |
| `updateSystemSettings` | `data: any` | `./app/actions/handson/all/settings/general.ts` |
| `createLocationType` | `data: any` | `./app/actions/handson/all/settings/lookups.ts` |
| `createOrgan` | `data: any` | `./app/actions/handson/all/settings/lookups.ts` |
| `createProvince` | `data: any` | `./app/actions/handson/all/settings/lookups.ts` |
| `deleteLocationType` | `name: string` | `./app/actions/handson/all/settings/lookups.ts` |
| `deleteOrgan` | `name: string` | `./app/actions/handson/all/settings/lookups.ts` |
| `deleteProvince` | `name: string` | `./app/actions/handson/all/settings/lookups.ts` |
| `getLocationTypes` | `` | `./app/actions/handson/all/settings/lookups.ts` |
| `getOrgans` | `` | `./app/actions/handson/all/settings/lookups.ts` |
| `getProvinces` | `` | `./app/actions/handson/all/settings/lookups.ts` |
| `updateUserProfile` | `email: string, data: { first_name?: string; last_name?: string; gender?: string; birth_date?: string }` | `./app/actions/handson/all/settings/profile.ts` |
| `getCalendarEvents` | `start?: string, end?: string` | `./app/actions/handson/all/workspace/calendar.ts` |
| `addComment` | `doctype: string, docname: string, content: string` | `./app/actions/handson/all/workspace/communication.ts` |
| `getCommunications` | `doctype: string, docname: string` | `./app/actions/handson/all/workspace/communication.ts` |
| `createWorkItem` | `type: WorkItemType, data: any` | `./app/actions/handson/all/workspace/dashboard.ts` |
| `getWorkItems` | `type: WorkItemType` | `./app/actions/handson/all/workspace/dashboard.ts` |
| `createEvent` | `data: EventData` | `./app/actions/handson/all/workspace/events.ts` |
| `deleteEvent` | `name: string` | `./app/actions/handson/all/workspace/events.ts` |
| `getEvents` | `filters?: any` | `./app/actions/handson/all/workspace/events.ts` |
| `deleteGlobalAnnouncement` | `name: string` | `./app/actions/handson/control/announcements/announcements.ts` |
| `getGlobalAnnouncements` | `` | `./app/actions/handson/control/announcements/announcements.ts` |
| `saveGlobalAnnouncement` | `ann: Announcement` | `./app/actions/handson/control/announcements/announcements.ts` |
| `seedAnnouncements` | `` | `./app/actions/handson/control/announcements/announcements.ts` |
| `deleteExcludedDoctype` | `name: string` | `./app/actions/handson/control/developer/developer.ts` |
| `deleteExcludedSwaggerDoctype` | `name: string` | `./app/actions/handson/control/developer/developer.ts` |
| `deleteExcludedSwaggerModule` | `name: string` | `./app/actions/handson/control/developer/developer.ts` |
| `deleteSwaggerAppRename` | `name: string` | `./app/actions/handson/control/developer/developer.ts` |
| `generateSwaggerDocumentation` | `` | `./app/actions/handson/control/developer/developer.ts` |
| `getExcludedDoctypes` | `` | `./app/actions/handson/control/developer/developer.ts` |
| `getExcludedSwaggerDoctypes` | `` | `./app/actions/handson/control/developer/developer.ts` |
| `getExcludedSwaggerModules` | `` | `./app/actions/handson/control/developer/developer.ts` |
| `getRawNeurotrophinCache` | `` | `./app/actions/handson/control/developer/developer.ts` |
| `getRawTenderCache` | `` | `./app/actions/handson/control/developer/developer.ts` |
| `getSwaggerAppRenames` | `` | `./app/actions/handson/control/developer/developer.ts` |
| `getSwaggerSettings` | `` | `./app/actions/handson/control/developer/developer.ts` |
| `getTenantErrorLogs` | `` | `./app/actions/handson/control/developer/developer.ts` |
| `createCustomerWallet` | `data: any` | `./app/actions/handson/control/finance/finance.ts` |
| `createTenantPayoutRequest` | `data: any` | `./app/actions/handson/control/finance/finance.ts` |
| `createWalletLedger` | `data: any` | `./app/actions/handson/control/finance/finance.ts` |
| `deleteCustomerWallet` | `name: string` | `./app/actions/handson/control/finance/finance.ts` |
| `deleteTenantPayoutRequest` | `name: string` | `./app/actions/handson/control/finance/finance.ts` |
| `deleteWalletLedger` | `name: string` | `./app/actions/handson/control/finance/finance.ts` |
| `getCustomerWallets` | `` | `./app/actions/handson/control/finance/finance.ts` |
| `getTenantPayoutRequests` | `` | `./app/actions/handson/control/finance/finance.ts` |
| `getWalletLedgers` | `` | `./app/actions/handson/control/finance/finance.ts` |
| `updateCustomerWallet` | `name: string, data: any` | `./app/actions/handson/control/finance/finance.ts` |
| `updateTenantPayoutRequest` | `name: string, data: any` | `./app/actions/handson/control/finance/finance.ts` |
| `updateWalletLedger` | `name: string, data: any` | `./app/actions/handson/control/finance/finance.ts` |
| `createMasterTemplate` | `name: string, subject: string, content: string` | `./app/actions/handson/control/notifications/templates.ts` |
| `getMasterTemplates` | `` | `./app/actions/handson/control/notifications/templates.ts` |
| `saveMasterTemplate` | `name: string, subject: string, content: string` | `./app/actions/handson/control/notifications/templates.ts` |
| `deleteMasterPrintFormat` | `name: string` | `./app/actions/handson/control/print_formats/print_formats.ts` |
| `getMasterPrintFormats` | `doctype?: string` | `./app/actions/handson/control/print_formats/print_formats.ts` |
| `saveMasterPrintFormat` | `name: string, doctype: string, html: string` | `./app/actions/handson/control/print_formats/print_formats.ts` |
| `deleteGlobalReport` | `name: string` | `./app/actions/handson/control/reports/reports.ts` |
| `getGlobalReports` | `` | `./app/actions/handson/control/reports/reports.ts` |
| `saveGlobalReport` | `report: ReportDefinition` | `./app/actions/handson/control/reports/reports.ts` |
| `seedReports` | `` | `./app/actions/handson/control/reports/reports.ts` |
| `createBackup` | `website: string, backup_type: string = 'Full'` | `./app/actions/handson/control/rpanel/backups/manage-backup.ts` |
| `deleteBackup` | `backup_id: string` | `./app/actions/handson/control/rpanel/backups/manage-backup.ts` |
| `getBackups` | `website?: string` | `./app/actions/handson/control/rpanel/backups/manage-backup.ts` |
| `restoreBackup` | `backup_id: string` | `./app/actions/handson/control/rpanel/backups/manage-backup.ts` |
| `createCronJob` | `data: any` | `./app/actions/handson/control/rpanel/cron/manage-cron.ts` |
| `deleteCronJob` | `name: string` | `./app/actions/handson/control/rpanel/cron/manage-cron.ts` |
| `getCronJobs` | `website?: string` | `./app/actions/handson/control/rpanel/cron/manage-cron.ts` |
| `updateCronJob` | `name: string, data: any` | `./app/actions/handson/control/rpanel/cron/manage-cron.ts` |
| `getClientUsage` | `` | `./app/actions/handson/control/rpanel/dashboard/get-client-usage.ts` |
| `getServerInfo` | `` | `./app/actions/handson/control/rpanel/dashboard/get-server-info.ts` |
| `getDatabases` | `clientName?: string` | `./app/actions/handson/control/rpanel/databases/manage-database.ts` |
| `updateDatabasePassword` | `websiteName: string, newPassword: string` | `./app/actions/handson/control/rpanel/databases/manage-database.ts` |
| `createEmailAccount` | `website: string, emailUser: string, password: string` | `./app/actions/handson/control/rpanel/emails/manage-email.ts` |
| `deleteEmailAccount` | `website: string, emailUser: string` | `./app/actions/handson/control/rpanel/emails/manage-email.ts` |
| `getEmails` | `clientName?: string` | `./app/actions/handson/control/rpanel/emails/manage-email.ts` |
| `updateEmailPassword` | `website: string, emailUser: string, newPassword: string` | `./app/actions/handson/control/rpanel/emails/manage-email.ts` |
| `deleteFile` | `website: string, filePath: string` | `./app/actions/handson/control/rpanel/files.ts` |
| `getFiles` | `website: string, path: string` | `./app/actions/handson/control/rpanel/files.ts` |
| `createFtpAccount` | `website: string, username: string, password: string` | `./app/actions/handson/control/rpanel/ftp/manage-ftp.ts` |
| `deleteFtpAccount` | `name: string` | `./app/actions/handson/control/rpanel/ftp/manage-ftp.ts` |
| `getFtpAccounts` | `clientName?: string` | `./app/actions/handson/control/rpanel/ftp/manage-ftp.ts` |
| `updateFtpPassword` | `name: string, newPassword: string` | `./app/actions/handson/control/rpanel/ftp/manage-ftp.ts` |
| `clearLog` | `website: string, logType: string` | `./app/actions/handson/control/rpanel/logs/view-logs.ts` |
| `getLogContent` | `website: string, logType: string, lines: number = 100` | `./app/actions/handson/control/rpanel/logs/view-logs.ts` |
| `getLogStats` | `website: string` | `./app/actions/handson/control/rpanel/logs/view-logs.ts` |
| `createWebsite` | `data: any` | `./app/actions/handson/control/rpanel/websites/create-website.ts` |
| `getClientWebsites` | `clientName?: string` | `./app/actions/handson/control/rpanel/websites/get-client-websites.ts` |
| `deleteWebsite` | `websiteName: string` | `./app/actions/handson/control/rpanel/websites/manage-website.ts` |
| `issueSSL` | `websiteName: string` | `./app/actions/handson/control/rpanel/websites/manage-website.ts` |
| `updateWebsite` | `websiteName: string, data: any` | `./app/actions/handson/control/rpanel/websites/manage-website.ts` |
| `createCompanySubscription` | `data: any` | `./app/actions/handson/control/subscriptions/subscriptions.ts` |
| `createSubscriptionPlan` | `data: any` | `./app/actions/handson/control/subscriptions/subscriptions.ts` |
| `deleteCompanySubscription` | `name: string` | `./app/actions/handson/control/subscriptions/subscriptions.ts` |
| `deleteSubscriptionPlan` | `name: string` | `./app/actions/handson/control/subscriptions/subscriptions.ts` |
| `getCompanySubscriptions` | `` | `./app/actions/handson/control/subscriptions/subscriptions.ts` |
| `getCustomers` | `` | `./app/actions/handson/control/subscriptions/subscriptions.ts` |
| `getModuleDefs` | `` | `./app/actions/handson/control/subscriptions/subscriptions.ts` |
| `getSubscriptionPlan` | `name: string` | `./app/actions/handson/control/subscriptions/subscriptions.ts` |
| `getSubscriptionPlans` | `` | `./app/actions/handson/control/subscriptions/subscriptions.ts` |
| `getSubscriptionSettings` | `` | `./app/actions/handson/control/subscriptions/subscriptions.ts` |
| `loginAsTenant` | `companyName: string` | `./app/actions/handson/control/subscriptions/subscriptions.ts` |
| `updateCompanySubscription` | `name: string, data: any` | `./app/actions/handson/control/subscriptions/subscriptions.ts` |
| `updateSubscriptionPlan` | `name: string, data: any` | `./app/actions/handson/control/subscriptions/subscriptions.ts` |
| `updateSubscriptionSettings` | `name: string, data: any` | `./app/actions/handson/control/subscriptions/subscriptions.ts` |
| `getGlobalSettings` | `` | `./app/actions/handson/control/system/global-settings.ts` |
| `toggleBetaMode` | `` | `./app/actions/handson/control/system/global-settings.ts` |
| `toggleDebugMode` | `` | `./app/actions/handson/control/system/global-settings.ts` |
| `deleteConfigItem` | `name: string` | `./app/actions/handson/control/system/master_config.ts` |
| `getMasterConfigItems` | `regionFilter?: string, categoryFilter?: string` | `./app/actions/handson/control/system/master_config.ts` |
| `saveConfigItem` | `item: ConfigItem` | `./app/actions/handson/control/system/master_config.ts` |
| `approveUpdate` | `name: string` | `./app/actions/handson/control/system/system.ts` |
| `deleteUpdateAuthorization` | `name: string` | `./app/actions/handson/control/system/system.ts` |
| `getBrainSettings` | `` | `./app/actions/handson/control/system/system.ts` |
| `getUpdateAuthorizations` | `` | `./app/actions/handson/control/system/system.ts` |
| `getWeatherSettings` | `` | `./app/actions/handson/control/system/system.ts` |
| `rejectUpdate` | `name: string` | `./app/actions/handson/control/system/system.ts` |
| `updateBrainSettings` | `name: string, data: any` | `./app/actions/handson/control/system/system.ts` |
| `updateWeatherSettings` | `name: string, data: any` | `./app/actions/handson/control/system/system.ts` |
| `createAvailableDID` | `data: any` | `./app/actions/handson/control/telephony/telephony.ts` |
| `createTelephonyCustomer` | `data: any` | `./app/actions/handson/control/telephony/telephony.ts` |
| `createTelephonySubscription` | `data: any` | `./app/actions/handson/control/telephony/telephony.ts` |
| `deleteAvailableDID` | `name: string` | `./app/actions/handson/control/telephony/telephony.ts` |
| `deleteTelephonyCustomer` | `name: string` | `./app/actions/handson/control/telephony/telephony.ts` |
| `deleteTelephonySubscription` | `name: string` | `./app/actions/handson/control/telephony/telephony.ts` |
| `getAvailableDIDs` | `` | `./app/actions/handson/control/telephony/telephony.ts` |
| `getTelephonyCustomers` | `` | `./app/actions/handson/control/telephony/telephony.ts` |
| `getTelephonySettings` | `` | `./app/actions/handson/control/telephony/telephony.ts` |
| `getTelephonySubscriptions` | `` | `./app/actions/handson/control/telephony/telephony.ts` |
| `getTelephonyTransactions` | `` | `./app/actions/handson/control/telephony/telephony.ts` |
| `updateAvailableDID` | `name: string, data: any` | `./app/actions/handson/control/telephony/telephony.ts` |
| `updateTelephonyCustomer` | `name: string, data: any` | `./app/actions/handson/control/telephony/telephony.ts` |
| `updateTelephonySettings` | `name: string, data: any` | `./app/actions/handson/control/telephony/telephony.ts` |
| `updateTelephonySubscription` | `name: string, data: any` | `./app/actions/handson/control/telephony/telephony.ts` |
| `createGeneratedTenderTask` | `data: any` | `./app/actions/handson/control/tender/tender.ts` |
| `createIntelligentTaskSet` | `data: any` | `./app/actions/handson/control/tender/tender.ts` |
| `createTenderWorkflowTask` | `data: any` | `./app/actions/handson/control/tender/tender.ts` |
| `createTenderWorkflowTemplate` | `data: any` | `./app/actions/handson/control/tender/tender.ts` |
| `deleteGeneratedTenderTask` | `name: string` | `./app/actions/handson/control/tender/tender.ts` |
| `deleteIntelligentTaskSet` | `name: string` | `./app/actions/handson/control/tender/tender.ts` |
| `deleteTenderWorkflowTask` | `name: string` | `./app/actions/handson/control/tender/tender.ts` |
| `deleteTenderWorkflowTemplate` | `name: string` | `./app/actions/handson/control/tender/tender.ts` |
| `getGeneratedTenderTasks` | `` | `./app/actions/handson/control/tender/tender.ts` |
| `getIntelligentTaskSets` | `` | `./app/actions/handson/control/tender/tender.ts` |
| `getTenderControlSettings` | `` | `./app/actions/handson/control/tender/tender.ts` |
| `getTenderWorkflowTasks` | `` | `./app/actions/handson/control/tender/tender.ts` |
| `getTenderWorkflowTemplates` | `` | `./app/actions/handson/control/tender/tender.ts` |
| `updateGeneratedTenderTask` | `name: string, data: any` | `./app/actions/handson/control/tender/tender.ts` |
| `updateIntelligentTaskSet` | `name: string, data: any` | `./app/actions/handson/control/tender/tender.ts` |
| `updateTenderControlSettings` | `name: string, data: any` | `./app/actions/handson/control/tender/tender.ts` |
| `updateTenderWorkflowTask` | `name: string, data: any` | `./app/actions/handson/control/tender/tender.ts` |
| `updateTenderWorkflowTemplate` | `name: string, data: any` | `./app/actions/handson/control/tender/tender.ts` |
| `deleteMasterTerm` | `name: string` | `./app/actions/handson/control/terms/terms.ts` |
| `getMasterTerms` | `` | `./app/actions/handson/control/terms/terms.ts` |
| `saveMasterTerm` | `name: string \| undefined, title: string, terms: string` | `./app/actions/handson/control/terms/terms.ts` |
| `createVoucher` | `data: any` | `./app/actions/handson/control/vouchers.ts` |
| `deleteVoucher` | `name: string` | `./app/actions/handson/control/vouchers.ts` |
| `getVouchers` | `` | `./app/actions/handson/control/vouchers.ts` |
| `updateVoucher` | `name: string, data: any` | `./app/actions/handson/control/vouchers.ts` |
| `applyGlobalWorkflows` | `doctype: string, data: any` | `./app/actions/handson/control/workflows/workflows.ts` |
| `deleteGlobalWorkflow` | `name: string` | `./app/actions/handson/control/workflows/workflows.ts` |
| `getGlobalWorkflows` | `doctype?: string` | `./app/actions/handson/control/workflows/workflows.ts` |
| `saveGlobalWorkflow` | `rule: WorkflowRule` | `./app/actions/handson/control/workflows/workflows.ts` |
| `seedWorkflows` | `` | `./app/actions/handson/control/workflows/workflows.ts` |
| `getMyAnnouncements` | `` | `./app/actions/handson/tenant/announcements/announcements.ts` |
| `getCompanySettings` | `` | `./app/actions/handson/tenant/settings/company.ts` |
| `updateCompanySettings` | `data: any` | `./app/actions/handson/tenant/settings/company.ts` |
| `getTenantEmailSettings` | `` | `./app/actions/handson/tenant/settings/email.ts` |
| `updateTenantEmailSettings` | `data: any` | `./app/actions/handson/tenant/settings/email.ts` |
| `connectIntegration` | `serviceName: string, config: any` | `./app/actions/handson/tenant/settings/integrations.ts` |
| `disconnectIntegration` | `serviceName: string` | `./app/actions/handson/tenant/settings/integrations.ts` |
| `getIntegrations` | `` | `./app/actions/handson/tenant/settings/integrations.ts` |
| `getStimulusCategories` | `` | `./app/actions/handson/tenant/settings/synaptic.ts` |
| `getSynapticSettings` | `` | `./app/actions/handson/tenant/settings/synaptic.ts` |
| `updateSynapticSettings` | `data: any` | `./app/actions/handson/tenant/settings/synaptic.ts` |
| `deleteTenantTerm` | `name: string` | `./app/actions/handson/tenant/settings/terms.ts` |
| `getAvailableMasterTerms` | `` | `./app/actions/handson/tenant/settings/terms.ts` |
| `getTenantTerms` | `` | `./app/actions/handson/tenant/settings/terms.ts` |
| `importMasterTerm` | `masterName: string` | `./app/actions/handson/tenant/settings/terms.ts` |
| `saveTenantTerm` | `name: string \| undefined, title: string, terms: string` | `./app/actions/handson/tenant/settings/terms.ts` |
| `createUser` | `data: { email: string; first_name: string; last_name?: string; role: UserRole }` | `./app/actions/handson/tenant/settings/users.ts` |
| `getUsers` | `` | `./app/actions/handson/tenant/settings/users.ts` |
| `getProviderTickets` | `` | `./app/actions/handson/tenant/support/support.ts` |
| `submitProviderTicket` | `data: ProviderTicketData` | `./app/actions/handson/tenant/support/support.ts` |
| `deleteApiErrorLog` | `name: string` | `./app/actions/handson/tenant/system/api_logs.ts` |
| `getApiErrorLog` | `name: string` | `./app/actions/handson/tenant/system/api_logs.ts` |
| `getApiErrorLogs` | `` | `./app/actions/handson/tenant/system/api_logs.ts` |
| `getStorageUsage` | `` | `./app/actions/handson/tenant/system/storage.ts` |
| `getSubscriptionStatus` | `` | `./app/actions/handson/tenant/system/subscriptions.ts` |
| `getTokenUsageLogs` | `` | `./app/actions/handson/tenant/system/token_usage.ts` |
| `createFAQ` | `data: any` | `./app/actions/paas/admin/content.ts` |
| `deleteFAQ` | `name: string` | `./app/actions/paas/admin/content.ts` |
| `getBanners` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` |
| `getBlogs` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` |
| `getBrands` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` |
| `getCareerCategories` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` |
| `getCareers` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` |
| `getFAQs` | `` | `./app/actions/paas/admin/content.ts` |
| `getGallery` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` |
| `getNotifications` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` |
| `getStories` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` |
| `getUnits` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/content.ts` |
| `updateFAQ` | `name: string, data: any` | `./app/actions/paas/admin/content.ts` |
| `getDeliverymanPayments` | `status: string = "Pending", page: number = 1, limit: number = 20` | `./app/actions/paas/admin/customers.ts` |
| `getSellerPayments` | `status: string = "Pending", page: number = 1, limit: number = 20` | `./app/actions/paas/admin/customers.ts` |
| `getSubscriberMessages` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/customers.ts` |
| `getSubscribers` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/customers.ts` |
| `getWallets` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/customers.ts` |
| `getAdminStatistics` | `` | `./app/actions/paas/admin/dashboard.ts` |
| `getDeliveries` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/deliveryman.ts` |
| `getDeliveryStatistics` | `` | `./app/actions/paas/admin/deliveryman.ts` |
| `getDeliverymanRequests` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/deliveryman.ts` |
| `getDeliverymanReviews` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/deliveryman.ts` |
| `updateDeliverymanRequest` | `name: string, status: string` | `./app/actions/paas/admin/deliveryman.ts` |
| `getPaymentPayloads` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/finance.ts` |
| `getPayouts` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/finance.ts` |
| `getSalesReport` | `fromDate: string, toDate: string, company?: string` | `./app/actions/paas/admin/finance.ts` |
| `getTransactions` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/finance.ts` |
| `getWalletHistory` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/finance.ts` |
| `createVehicleType` | `data: any` | `./app/actions/paas/admin/logistics.ts` |
| `deleteVehicleType` | `name: string` | `./app/actions/paas/admin/logistics.ts` |
| `getDeliverySettings` | `` | `./app/actions/paas/admin/logistics.ts` |
| `getDeliveryZones` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/logistics.ts` |
| `getVehicleTypes` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/logistics.ts` |
| `updateDeliverySettings` | `settings: any` | `./app/actions/paas/admin/logistics.ts` |
| `createReferral` | `data: any` | `./app/actions/paas/admin/marketing.ts` |
| `deleteReferral` | `name: string` | `./app/actions/paas/admin/marketing.ts` |
| `getAds` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/marketing.ts` |
| `getCashbackRules` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/marketing.ts` |
| `getEmailSubscribers` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/marketing.ts` |
| `getReferrals` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/marketing.ts` |
| `getShopAdsPackages` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/marketing.ts` |
| `getShopBonuses` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/marketing.ts` |
| `getBookings` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/orders.ts` |
| `getOrderReviews` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/orders.ts` |
| `getOrderStatuses` | `` | `./app/actions/paas/admin/orders.ts` |
| `getOrders` | `page: number = 1, limit: number = 20, type: string = "", status: string = ""` | `./app/actions/paas/admin/orders.ts` |
| `getParcelOrders` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/orders.ts` |
| `getRefunds` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/orders.ts` |
| `updateOrderStatus` | `name: string, status: string` | `./app/actions/paas/admin/orders.ts` |
| `updateRefund` | `name: string, status: string, answer?: string` | `./app/actions/paas/admin/orders.ts` |
| `createPOSOrder` | `orderData: any` | `./app/actions/paas/admin/pos.ts` |
| `getPOSCategories` | `` | `./app/actions/paas/admin/pos.ts` |
| `getPOSProducts` | `category: string = "", search: string = "", page: number = 1, limit: number = 20` | `./app/actions/paas/admin/pos.ts` |
| `getAllCategories` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/products.ts` |
| `getAllProductExtraGroups` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/products.ts` |
| `getAllProductReviews` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/products.ts` |
| `getAllProducts` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/products.ts` |
| `getAllReceipts` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/products.ts` |
| `getReportData` | `reportType: string, filters: any = {}` | `./app/actions/paas/admin/reports.ts` |
| `getRevenueReport` | `dateRange: { from: string, to: string }` | `./app/actions/paas/admin/reports.ts` |
| `createFlutterAppConfig` | `settings: any` | `./app/actions/paas/admin/settings.ts` |
| `createPrivacyPolicy` | `data: any` | `./app/actions/paas/admin/settings.ts` |
| `createTerm` | `data: any` | `./app/actions/paas/admin/settings.ts` |
| `deletePrivacyPolicy` | `name: string` | `./app/actions/paas/admin/settings.ts` |
| `deleteTerm` | `name: string` | `./app/actions/paas/admin/settings.ts` |
| `getAppSettings` | `` | `./app/actions/paas/admin/settings.ts` |
| `getAvailableSourceProjects` | `` | `./app/actions/paas/admin/settings.ts` |
| `getCurrencies` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/settings.ts` |
| `getEmailSettings` | `` | `./app/actions/paas/admin/settings.ts` |
| `getFlutterAppConfig` | `name: string` | `./app/actions/paas/admin/settings.ts` |
| `getFlutterAppSettings` | `` | `./app/actions/paas/admin/settings.ts` |
| `getFlutterBuildSettings` | `` | `./app/actions/paas/admin/settings.ts` |
| `getGeneralSettings` | `` | `./app/actions/paas/admin/settings.ts` |
| `getLandingPage` | `` | `./app/actions/paas/admin/settings.ts` |
| `getNotificationSettings` | `` | `./app/actions/paas/admin/settings.ts` |
| `getPages` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/settings.ts` |
| `getPaymentGateway` | `name: string` | `./app/actions/paas/admin/settings.ts` |
| `getPaymentMethods` | `` | `./app/actions/paas/admin/settings.ts` |
| `getPermissionSettings` | `` | `./app/actions/paas/admin/settings.ts` |
| `getPrivacyPolicies` | `` | `./app/actions/paas/admin/settings.ts` |
| `getSocialSettings` | `` | `./app/actions/paas/admin/settings.ts` |
| `getSystemInfo` | `` | `./app/actions/paas/admin/settings.ts` |
| `getTerms` | `` | `./app/actions/paas/admin/settings.ts` |
| `savePaymentGateway` | `doc: any` | `./app/actions/paas/admin/settings.ts` |
| `updateFlutterAppSettings` | `name: string, settings: any` | `./app/actions/paas/admin/settings.ts` |
| `updateFlutterBuildSettings` | `settings: any` | `./app/actions/paas/admin/settings.ts` |
| `updateGeneralSettings` | `settings: any` | `./app/actions/paas/admin/settings.ts` |
| `updateLandingPage` | `data: any` | `./app/actions/paas/admin/settings.ts` |
| `updatePaymentMethod` | `name: string, enabled: boolean` | `./app/actions/paas/admin/settings.ts` |
| `updatePermissionSettings` | `settings: any` | `./app/actions/paas/admin/settings.ts` |
| `updatePrivacyPolicy` | `name: string, data: any` | `./app/actions/paas/admin/settings.ts` |
| `updateTerm` | `name: string, data: any` | `./app/actions/paas/admin/settings.ts` |
| `createShop` | `data: any` | `./app/actions/paas/admin/shops.ts` |
| `deleteShop` | `name: string` | `./app/actions/paas/admin/shops.ts` |
| `getShopCategories` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/shops.ts` |
| `getShopReviews` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/shops.ts` |
| `getShopTags` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/shops.ts` |
| `getShopTypes` | `` | `./app/actions/paas/admin/shops.ts` |
| `getShopUnits` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/shops.ts` |
| `getShops` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/shops.ts` |
| `updateShop` | `name: string, data: any` | `./app/actions/paas/admin/shops.ts` |
| `deleteReview` | `name: string` | `./app/actions/paas/admin/support.ts` |
| `getNotifications` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/support.ts` |
| `getReviews` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/support.ts` |
| `getTickets` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/support.ts` |
| `updateTicket` | `name: string, data: any` | `./app/actions/paas/admin/support.ts` |
| `clearCache` | `` | `./app/actions/paas/admin/system.ts` |
| `createBackup` | `` | `./app/actions/paas/admin/system.ts` |
| `getBackups` | `` | `./app/actions/paas/admin/system.ts` |
| `getLanguages` | `` | `./app/actions/paas/admin/system.ts` |
| `getSystemInfo` | `` | `./app/actions/paas/admin/system.ts` |
| `getTranslations` | `` | `./app/actions/paas/admin/system.ts` |
| `triggerSystemUpdate` | `` | `./app/actions/paas/admin/system.ts` |
| `updateTranslation` | `name: string, value: string` | `./app/actions/paas/admin/system.ts` |
| `getPayoutRequests` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/transactions.ts` |
| `getPayouts` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/transactions.ts` |
| `getShopSubscriptions` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/transactions.ts` |
| `getTransactions` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/transactions.ts` |
| `updatePayoutRequest` | `name: string, status: string` | `./app/actions/paas/admin/transactions.ts` |
| `getPoints` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/users.ts` |
| `getReferrals` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/users.ts` |
| `getRoles` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/users.ts` |
| `getUsers` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/users.ts` |
| `createShopSection` | `data: any` | `./app/actions/paas/booking.ts` |
| `createTable` | `data: any` | `./app/actions/paas/booking.ts` |
| `deleteShopSection` | `name: string` | `./app/actions/paas/booking.ts` |
| `deleteTable` | `name: string` | `./app/actions/paas/booking.ts` |
| `getReservation` | `name: string` | `./app/actions/paas/booking.ts` |
| `getReservations` | `status?: string, dateFrom?: string, dateTo?: string` | `./app/actions/paas/booking.ts` |
| `getShopSections` | `` | `./app/actions/paas/booking.ts` |
| `getTables` | `sectionId: string` | `./app/actions/paas/booking.ts` |
| `updateReservationStatus` | `name: string, status: string` | `./app/actions/paas/booking.ts` |
| `updateShopSection` | `name: string, data: any` | `./app/actions/paas/booking.ts` |
| `updateTable` | `name: string, data: any` | `./app/actions/paas/booking.ts` |
| `createBranch` | `data: any` | `./app/actions/paas/branches.ts` |
| `deleteBranch` | `id: string` | `./app/actions/paas/branches.ts` |
| `getBranches` | `` | `./app/actions/paas/branches.ts` |
| `updateBranch` | `id: string, data: any` | `./app/actions/paas/branches.ts` |
| `createBrand` | `data: any` | `./app/actions/paas/brands.ts` |
| `deleteBrand` | `uuid: string` | `./app/actions/paas/brands.ts` |
| `getBrands` | `` | `./app/actions/paas/brands.ts` |
| `updateBrand` | `uuid: string, data: any` | `./app/actions/paas/brands.ts` |
| `getAdsPackages` | `` | `./app/actions/paas/business.ts` |
| `getMyShopSubscription` | `` | `./app/actions/paas/business.ts` |
| `getPurchasedAds` | `` | `./app/actions/paas/business.ts` |
| `getSubscriptions` | `` | `./app/actions/paas/business.ts` |
| `purchaseAdsPackage` | `packageName: string` | `./app/actions/paas/business.ts` |
| `subscribeMyShop` | `subscriptionId: string` | `./app/actions/paas/business.ts` |
| `createCategory` | `data: any` | `./app/actions/paas/categories.ts` |
| `deleteCategory` | `id: string` | `./app/actions/paas/categories.ts` |
| `getCategories` | `` | `./app/actions/paas/categories.ts` |
| `updateCategory` | `id: string, data: any` | `./app/actions/paas/categories.ts` |
| `getCustomerDetails` | `customerId: string` | `./app/actions/paas/customers.ts` |
| `getCustomers` | `page: number = 1, perPage: number = 20` | `./app/actions/paas/customers.ts` |
| `getDashboardStats` | `` | `./app/actions/paas/dashboard.ts` |
| `checkDeliveryFee` | `lat: number, lng: number` | `./app/actions/paas/delivery-zones.ts` |
| `createDeliveryZone` | `data: any` | `./app/actions/paas/delivery-zones.ts` |
| `deleteDeliveryZone` | `name: string` | `./app/actions/paas/delivery-zones.ts` |
| `getDeliveryZones` | `` | `./app/actions/paas/delivery-zones.ts` |
| `getDeliveryOrders` | `page: number = 1, limit: number = 20` | `./app/actions/paas/delivery.ts` |
| `getDeliverySettings` | `` | `./app/actions/paas/delivery.ts` |
| `getDeliveryStatistics` | `` | `./app/actions/paas/delivery.ts` |
| `getDeliveryZones` | `` | `./app/actions/paas/delivery.ts` |
| `getParcelOrders` | `page: number = 1, limit: number = 20` | `./app/actions/paas/delivery.ts` |
| `getPayouts` | `page: number = 1, limit: number = 20` | `./app/actions/paas/delivery.ts` |
| `updateDeliverySettings` | `settings: any` | `./app/actions/paas/delivery.ts` |
| `createExtraGroup` | `data: any` | `./app/actions/paas/extras.ts` |
| `createExtraValue` | `data: any` | `./app/actions/paas/extras.ts` |
| `deleteExtraGroup` | `name: string` | `./app/actions/paas/extras.ts` |
| `deleteExtraValue` | `name: string` | `./app/actions/paas/extras.ts` |
| `getExtraGroups` | `` | `./app/actions/paas/extras.ts` |
| `getExtraValues` | `groupId: string` | `./app/actions/paas/extras.ts` |
| `updateExtraGroup` | `name: string, data: any` | `./app/actions/paas/extras.ts` |
| `getPartnerPayments` | `` | `./app/actions/paas/finance.ts` |
| `getPayouts` | `` | `./app/actions/paas/finance.ts` |
| `getShopPayments` | `` | `./app/actions/paas/finance.ts` |
| `getTransactions` | `` | `./app/actions/paas/finance.ts` |
| `getWallet` | `` | `./app/actions/paas/finance.ts` |
| `getWalletHistory` | `` | `./app/actions/paas/finance.ts` |
| `topUpWallet` | `amount: number` | `./app/actions/paas/finance.ts` |
| `addGalleryImage` | `data: any` | `./app/actions/paas/gallery.ts` |
| `deleteGalleryImage` | `name: string` | `./app/actions/paas/gallery.ts` |
| `getGalleryImages` | `` | `./app/actions/paas/gallery.ts` |
| `getSellerInvites` | `` | `./app/actions/paas/invites.ts` |
| `updateInviteStatus` | `inviteId: string, status: "Accepted" \| "Rejected"` | `./app/actions/paas/invites.ts` |
| `createCoupon` | `data: any` | `./app/actions/paas/marketing.ts` |
| `deleteCoupon` | `name: string` | `./app/actions/paas/marketing.ts` |
| `getBonuses` | `` | `./app/actions/paas/marketing.ts` |
| `getCoupons` | `` | `./app/actions/paas/marketing.ts` |
| `updateCoupon` | `name: string, data: any` | `./app/actions/paas/marketing.ts` |
| `createCombo` | `data: any` | `./app/actions/paas/operations.ts` |
| `createKitchen` | `data: any` | `./app/actions/paas/operations.ts` |
| `createMenu` | `data: any` | `./app/actions/paas/operations.ts` |
| `deleteCombo` | `name: string` | `./app/actions/paas/operations.ts` |
| `deleteKitchen` | `name: string` | `./app/actions/paas/operations.ts` |
| `deleteMenu` | `name: string` | `./app/actions/paas/operations.ts` |
| `getCombos` | `` | `./app/actions/paas/operations.ts` |
| `getKitchens` | `` | `./app/actions/paas/operations.ts` |
| `getMenus` | `` | `./app/actions/paas/operations.ts` |
| `updateKitchen` | `name: string, data: any` | `./app/actions/paas/operations.ts` |
| `getOrder` | `id: string` | `./app/actions/paas/orders.ts` |
| `getOrders` | `page: number = 1, perPage: number = 20, status?: string` | `./app/actions/paas/orders.ts` |
| `updateOrderStatus` | `id: string, status: string` | `./app/actions/paas/orders.ts` |
| `createParcelSetting` | `data: any` | `./app/actions/paas/parcel.ts` |
| `deleteParcelSetting` | `name: string` | `./app/actions/paas/parcel.ts` |
| `getParcelOrder` | `name: string` | `./app/actions/paas/parcel.ts` |
| `getParcelOrders` | `limit = 20, offset = 0` | `./app/actions/paas/parcel.ts` |
| `getParcelSettings` | `` | `./app/actions/paas/parcel.ts` |
| `updateParcelSetting` | `name: string, data: any` | `./app/actions/paas/parcel.ts` |
| `updateParcelStatus` | `name: string, status: string` | `./app/actions/paas/parcel.ts` |
| `createPOSOrder` | `orderData: any` | `./app/actions/paas/pos.ts` |
| `adjustInventory` | `itemCode: string, warehouse: string, newQty: number` | `./app/actions/paas/products.ts` |
| `createProduct` | `data: any` | `./app/actions/paas/products.ts` |
| `deleteProduct` | `name: string` | `./app/actions/paas/products.ts` |
| `getInventory` | `itemCode: string` | `./app/actions/paas/products.ts` |
| `getProduct` | `name: string` | `./app/actions/paas/products.ts` |
| `getProducts` | `page: number = 1, perPage: number = 20` | `./app/actions/paas/products.ts` |
| `updateProduct` | `name: string, data: any` | `./app/actions/paas/products.ts` |
| `getReceiptDetails` | `id: string` | `./app/actions/paas/receipts.ts` |
| `getReceipts` | `` | `./app/actions/paas/receipts.ts` |
| `getRefunds` | `` | `./app/actions/paas/refunds.ts` |
| `getReviews` | `` | `./app/actions/paas/refunds.ts` |
| `updateRefund` | `refundId: string, status: string, answer?: string` | `./app/actions/paas/refunds.ts` |
| `getOrderReport` | `fromDate?: string, toDate?: string` | `./app/actions/paas/reports.ts` |
| `getSellerStatistics` | `` | `./app/actions/paas/reports.ts` |
| `getShop` | `` | `./app/actions/paas/shop.ts` |
| `getShops` | `` | `./app/actions/paas/shop.ts` |
| `setWorkingStatus` | `status: boolean` | `./app/actions/paas/shop.ts` |
| `updateShop` | `data: any` | `./app/actions/paas/shop.ts` |
| `getCooks` | `` | `./app/actions/paas/staff.ts` |
| `getDeliveryMen` | `` | `./app/actions/paas/staff.ts` |
| `getWaiters` | `` | `./app/actions/paas/staff.ts` |
| `createStory` | `data: any` | `./app/actions/paas/stories.ts` |
| `deleteStory` | `id: string` | `./app/actions/paas/stories.ts` |
| `getStories` | `` | `./app/actions/paas/stories.ts` |
| `uploadFile` | `formData: FormData` | `./app/actions/paas/upload.ts` |
| `getWhatsAppConfig` | `` | `./app/actions/paas/whatsapp.ts` |
| `updateWhatsAppConfig` | `data: any` | `./app/actions/paas/whatsapp.ts` |
| `getWorkingHours` | `` | `./app/actions/paas/working-hours.ts` |
| `updateWorkingHours` | `data: any` | `./app/actions/paas/working-hours.ts` |
| `getClientSubscriptions` | `` | `./app/actions/portal/client.ts` |
| `getCurrentEmployeeId` | `` | `./app/lib/roles.ts` |
| `getLendingLicenseDetails` | `` | `./app/lib/roles.ts` |
| `verifyActiveEmployee` | `` | `./app/lib/roles.ts` |
| `verifyCrmRole` | `` | `./app/lib/roles.ts` |
| `verifyFinanceRole` | `` | `./app/lib/roles.ts` |
| `verifyHrRole` | `` | `./app/lib/roles.ts` |
| `verifyLendingLicense` | `` | `./app/lib/roles.ts` |
| `verifyLendingRole` | `` | `./app/lib/roles.ts` |
| `verifyLmsRole` | `` | `./app/lib/roles.ts` |
| `verifySupplyChainRole` | `` | `./app/lib/roles.ts` |
| `verifySystemManager` | `` | `./app/lib/roles.ts` |
| `getGuestCountryCode` | `` | `./app/services/common/geoip.ts` |
| `getPricingMetadata` | `userCountry?: string` | `./lib/actions/getPricingMetadata.ts` |
| `getSubscriptionPlans` | `category?: string` | `./lib/actions/getSubscriptionPlans.ts` |
