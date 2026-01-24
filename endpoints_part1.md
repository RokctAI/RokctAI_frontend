# API Endpoints (Part 1 of 6)

| No. | App | Endpoint | Payload / Arguments | Path | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | ACCOUNTING | `cancelPayment` | `name: string` | `./app/actions/handson/all/accounting/payments/cancelPayment.ts` | Server Action |
| 2 | ACCOUNTING | `createAsset` | `data: AssetData` | `./app/actions/handson/all/accounting/assets/createAsset.ts` | Server Action |
| 3 | ACCOUNTING | `createAssetCapitalization` | `data: { entry_type: string; target_asset?: string; posting_date: string; stock_items: { item_code: string; qty: number }[] }` | `./app/actions/handson/all/accounting/assets/capitalization/createAssetCapitalization.ts` | Server Action |
| 4 | ACCOUNTING | `createAssetMaintenance` | `data: AssetMaintenanceData` | `./app/actions/handson/all/accounting/assets/maintenance/createAssetMaintenance.ts` | Server Action |
| 5 | ACCOUNTING | `createAssetMovement` | `data: { transaction_date: string; purpose: string; assets: { asset: string; target_location?: string }[] }` | `./app/actions/handson/all/accounting/assets/movement/createAssetMovement.ts` | Server Action |
| 6 | ACCOUNTING | `createAssetRepair` | `data: { asset: string; failure_date: string; description: string; total_repair_cost: number }` | `./app/actions/handson/all/accounting/assets/repair/createAssetRepair.ts` | Server Action |
| 7 | ACCOUNTING | `createAssetValueAdjustment` | `data: AssetValueAdjustmentData` | `./app/actions/handson/all/accounting/assets/value_adjustment/createAssetValueAdjustment.ts` | Server Action |
| 8 | ACCOUNTING | `createBOM` | `item: string, quantity: number, items: { item_code: string; qty: number }[]` | `./app/actions/handson/all/accounting/manufacturing/bom.ts` | Server Action |
| 9 | ACCOUNTING | `createBlanketOrder` | `data: { supplier: string; to_date: string; items: { item_code: string; qty: number; rate: number }[] }` | `./app/actions/handson/all/accounting/buying/order.ts` | Server Action |
| 10 | ACCOUNTING | `createBudget` | `data: BudgetData` | `./app/actions/handson/all/accounting/budgets/createBudget.ts` | Server Action |
| 11 | ACCOUNTING | `createCostCenter` | `data: CostCenterData` | `./app/actions/handson/all/accounting/cost_centers/createCostCenter.ts` | Server Action |
| 12 | ACCOUNTING | `createDeliveryNote` | `data: DeliveryNoteData` | `./app/actions/handson/all/accounting/selling/delivery_note.ts` | Server Action |
| 13 | ACCOUNTING | `createInvoice` | `data: InvoiceData` | `./app/actions/handson/all/accounting/invoices/createInvoice.ts` | Server Action |
| 14 | ACCOUNTING | `createItem` | `data: ItemData` | `./app/actions/handson/all/accounting/inventory/item.ts` | Server Action |
| 15 | ACCOUNTING | `createJournalEntry` | `data: JournalEntryData` | `./app/actions/handson/all/accounting/journals/createJournalEntry.ts` | Server Action |
| 16 | ACCOUNTING | `createLandedCostVoucher` | `data: { company: string; receipt_document_type: string; receipt_document: string; taxes: { account: string; amount: number }[] }` | `./app/actions/handson/all/accounting/inventory/stock.ts` | Server Action |
| 17 | ACCOUNTING | `createMaterialRequest` | `data: { transaction_date: string; material_request_type: string; items: { item_code: string; qty: number; schedule_date: string }[] }` | `./app/actions/handson/all/accounting/inventory/logistics.ts` | Server Action |
| 18 | ACCOUNTING | `createPayment` | `data: PaymentData` | `./app/actions/handson/all/accounting/payments/createPayment.ts` | Server Action |
| 19 | ACCOUNTING | `createPickList` | `data: { purpose: string; locations: { item_code: string; qty: number; warehouse: string }[] }` | `./app/actions/handson/all/accounting/inventory/logistics.ts` | Server Action |
| 20 | ACCOUNTING | `createProductBundle` | `data: { new_item_code: string; items: { item_code: string; qty: number }[] }` | `./app/actions/handson/all/accounting/selling/extras.ts` | Server Action |
| 21 | ACCOUNTING | `createProductionPlan` | `data: ProductionPlanData` | `./app/actions/handson/all/accounting/manufacturing/production_plan.ts` | Server Action |
| 22 | ACCOUNTING | `createPurchaseInvoice` | `data: PurchaseInvoiceData` | `./app/actions/handson/all/accounting/purchases/createPurchaseInvoice.ts` | Server Action |
| 23 | ACCOUNTING | `createPurchaseOrder` | `data: PurchaseOrderData` | `./app/actions/handson/all/accounting/buying/order.ts` | Server Action |
| 24 | ACCOUNTING | `createPurchaseReceipt` | `data: PurchaseReceiptData` | `./app/actions/handson/all/accounting/buying/receipt.ts` | Server Action |
| 25 | ACCOUNTING | `createQualityInspection` | `data: { inspection_type: string; reference_type: string; reference_name: string; status: string }` | `./app/actions/handson/all/accounting/buying/quality.ts` | Server Action |
| 26 | ACCOUNTING | `createQuotation` | `data: QuotationData` | `./app/actions/handson/all/accounting/selling/quotation.ts` | Server Action |
| 27 | ACCOUNTING | `createRFQ` | `data: { transaction_date: string; suppliers: { supplier: string }[]; items: { item_code: string; qty: number }[] }` | `./app/actions/handson/all/accounting/buying/rfq.ts` | Server Action |
| 28 | ACCOUNTING | `createRouting` | `data: { routing_name: string; operations: { operation: string; workstation: string; time_in_mins: number }[] }` | `./app/actions/handson/all/accounting/manufacturing/routing.ts` | Server Action |
| 29 | ACCOUNTING | `createSalesOrder` | `data: any` | `./app/actions/handson/all/accounting/selling/sales_order.ts` | Server Action |
| 30 | ACCOUNTING | `createSalesPartner` | `data: { partner_name: string; commission_rate: number; partner_type?: string }` | `./app/actions/handson/all/accounting/selling/extras.ts` | Server Action |
| 31 | ACCOUNTING | `createShipment` | `data: { delivery_from_type: string; delivery_from: string; carrier: string; tracking_number?: string }` | `./app/actions/handson/all/accounting/inventory/logistics.ts` | Server Action |
| 32 | ACCOUNTING | `createShippingRule` | `data: { label: string; calculate_based_on: string; shipping_amount?: number }` | `./app/actions/handson/all/accounting/selling/extras.ts` | Server Action |
| 33 | ACCOUNTING | `createShopFloorItem` | `data: ShopFloorData` | `./app/actions/handson/all/accounting/manufacturing/shop_floor.ts` | Server Action |
| 34 | ACCOUNTING | `createStockEntry` | `data: any` | `./app/actions/handson/all/accounting/inventory/stock.ts` | Server Action |
| 35 | ACCOUNTING | `createStockReconciliation` | `data: { company: string; posting_date: string; items: { item_code: string; qty: number; warehouse: string; valuation_rate: number }[] }` | `./app/actions/handson/all/accounting/inventory/stock.ts` | Server Action |
| 36 | ACCOUNTING | `createSubcontractingOrder` | `data: SubcontractingOrderData` | `./app/actions/handson/all/accounting/buying/subcontracting.ts` | Server Action |
| 37 | ACCOUNTING | `createSubcontractingReceipt` | `data: SubcontractingReceiptData` | `./app/actions/handson/all/accounting/buying/subcontracting.ts` | Server Action |
| 38 | ACCOUNTING | `createSupplier` | `data: SupplierData` | `./app/actions/handson/all/accounting/buying/supplier.ts` | Server Action |
| 39 | ACCOUNTING | `createSupplierQuotation` | `data: { supplier: string; items: { item_code: string; qty: number; rate: number }[] }` | `./app/actions/handson/all/accounting/buying/supplier.ts` | Server Action |
| 40 | ACCOUNTING | `createWorkOrder` | `data: { production_item: string; qty: number; company: string; plan_start_date: string }` | `./app/actions/handson/all/accounting/manufacturing/work_order.ts` | Server Action |
| 41 | ACCOUNTING | `deleteAsset` | `name: string` | `./app/actions/handson/all/accounting/assets/deleteAsset.ts` | Server Action |
| 42 | ACCOUNTING | `deleteBOM` | `name: string` | `./app/actions/handson/all/accounting/manufacturing/bom.ts` | Server Action |
| 43 | ACCOUNTING | `deleteInvoice` | `name: string` | `./app/actions/handson/all/accounting/invoices/deleteInvoice.ts` | Server Action |
| 44 | ACCOUNTING | `deleteItem` | `item_code: string` | `./app/actions/handson/all/accounting/inventory/item.ts` | Server Action |
| 45 | ACCOUNTING | `deletePurchaseInvoice` | `name: string` | `./app/actions/handson/all/accounting/purchases/deletePurchaseInvoice.ts` | Server Action |
| 46 | ACCOUNTING | `deletePurchaseOrder` | `name: string` | `./app/actions/handson/all/accounting/buying/order.ts` | Server Action |
| 47 | ACCOUNTING | `deleteQuotation` | `name: string` | `./app/actions/handson/all/accounting/selling/quotation.ts` | Server Action |
| 48 | ACCOUNTING | `getActiveQuotations` | `` | `./app/actions/handson/all/accounting/selling/quotation.ts` | Server Action |
| 49 | ACCOUNTING | `getAsset` | `name: string` | `./app/actions/handson/all/accounting/assets/getAsset.ts` | Server Action |
| 50 | ACCOUNTING | `getAssetCapitalizations` | `` | `./app/actions/handson/all/accounting/assets/capitalization/getAssetCapitalizations.ts` | Server Action |
| 51 | ACCOUNTING | `getAssetDepreciationSchedules` | `` | `./app/actions/handson/all/accounting/assets/depreciation/getAssetDepreciationSchedules.ts` | Server Action |
| 52 | ACCOUNTING | `getAssetMaintenances` | `` | `./app/actions/handson/all/accounting/assets/maintenance/getAssetMaintenances.ts` | Server Action |
| 53 | ACCOUNTING | `getAssetMovements` | `` | `./app/actions/handson/all/accounting/assets/movement/getAssetMovements.ts` | Server Action |
| 54 | ACCOUNTING | `getAssetRepairs` | `` | `./app/actions/handson/all/accounting/assets/repair/getAssetRepairs.ts` | Server Action |
| 55 | ACCOUNTING | `getAssetValueAdjustments` | `` | `./app/actions/handson/all/accounting/assets/value_adjustment/getAssetValueAdjustments.ts` | Server Action |
| 56 | ACCOUNTING | `getAssets` | `` | `./app/actions/handson/all/accounting/assets/getAssets.ts` | Server Action |
| 57 | ACCOUNTING | `getBOM` | `name: string` | `./app/actions/handson/all/accounting/manufacturing/bom.ts` | Server Action |
| 58 | ACCOUNTING | `getBOMs` | `` | `./app/actions/handson/all/accounting/manufacturing/bom.ts` | Server Action |
| 59 | ACCOUNTING | `getBatches` | `` | `./app/actions/handson/all/accounting/inventory/batch_serial.ts` | Server Action |
| 60 | ACCOUNTING | `getBlanketOrders` | `` | `./app/actions/handson/all/accounting/buying/order.ts` | Server Action |
| 61 | ACCOUNTING | `getBudgets` | `` | `./app/actions/handson/all/accounting/budgets/getBudgets.ts` | Server Action |
| 62 | ACCOUNTING | `getCostCenters` | `` | `./app/actions/handson/all/accounting/cost_centers/getCostCenters.ts` | Server Action |
| 63 | ACCOUNTING | `getCustomers` | `` | `./app/actions/handson/all/accounting/selling/sales_order.ts` | Server Action |
| 64 | ACCOUNTING | `getDeliveryNote` | `name: string` | `./app/actions/handson/all/accounting/selling/delivery_note.ts` | Server Action |
| 65 | ACCOUNTING | `getDeliveryNotes` | `` | `./app/actions/handson/all/accounting/selling/delivery_note.ts` | Server Action |
| 66 | ACCOUNTING | `getGLEntries` | `filters?: any` | `./app/actions/handson/all/accounting/journals/getGLEntries.ts` | Server Action |
| 67 | ACCOUNTING | `getInvoice` | `name: string` | `./app/actions/handson/all/accounting/invoices/getInvoice.ts` | Server Action |
| 68 | ACCOUNTING | `getItem` | `item_code: string` | `./app/actions/handson/all/accounting/inventory/item.ts` | Server Action |
| 69 | ACCOUNTING | `getItems` | `` | `./app/actions/handson/all/accounting/inventory/item.ts` | Server Action |
| 70 | ACCOUNTING | `getJournalEntries` | `` | `./app/actions/handson/all/accounting/journals/getJournalEntries.ts` | Server Action |
| 71 | ACCOUNTING | `getLandedCostVouchers` | `` | `./app/actions/handson/all/accounting/inventory/stock.ts` | Server Action |
| 72 | ACCOUNTING | `getMaterialRequests` | `` | `./app/actions/handson/all/accounting/inventory/logistics.ts` | Server Action |
| 73 | ACCOUNTING | `getPayment` | `name: string` | `./app/actions/handson/all/accounting/payments/getPayment.ts` | Server Action |
| 74 | ACCOUNTING | `getPayments` | `` | `./app/actions/handson/all/accounting/payments/getPayments.ts` | Server Action |
| 75 | ACCOUNTING | `getPickLists` | `` | `./app/actions/handson/all/accounting/inventory/logistics.ts` | Server Action |
| 76 | ACCOUNTING | `getProductBundles` | `` | `./app/actions/handson/all/accounting/selling/extras.ts` | Server Action |
| 77 | ACCOUNTING | `getProductionPlans` | `` | `./app/actions/handson/all/accounting/manufacturing/production_plan.ts` | Server Action |
| 78 | ACCOUNTING | `getPurchaseInvoices` | `` | `./app/actions/handson/all/accounting/purchases/getPurchaseInvoices.ts` | Server Action |
| 79 | ACCOUNTING | `getPurchaseOrder` | `name: string` | `./app/actions/handson/all/accounting/buying/order.ts` | Server Action |
| 80 | ACCOUNTING | `getPurchaseOrders` | `` | `./app/actions/handson/all/accounting/buying/order.ts` | Server Action |
| 81 | ACCOUNTING | `getPurchaseReceipts` | `` | `./app/actions/handson/all/accounting/buying/receipt.ts` | Server Action |
| 82 | ACCOUNTING | `getQualityInspections` | `` | `./app/actions/handson/all/accounting/buying/quality.ts` | Server Action |
| 83 | ACCOUNTING | `getQuotation` | `name: string` | `./app/actions/handson/all/accounting/selling/quotation.ts` | Server Action |
| 84 | ACCOUNTING | `getQuotations` | `` | `./app/actions/handson/all/accounting/selling/quotation.ts` | Server Action |
| 85 | ACCOUNTING | `getRFQs` | `` | `./app/actions/handson/all/accounting/buying/rfq.ts` | Server Action |
| 86 | ACCOUNTING | `getRoutings` | `` | `./app/actions/handson/all/accounting/manufacturing/routing.ts` | Server Action |
| 87 | ACCOUNTING | `getSalesInvoices` | `` | `./app/actions/handson/all/accounting/invoices/getSalesInvoices.ts` | Server Action |
| 88 | ACCOUNTING | `getSalesOrder` | `name: string` | `./app/actions/handson/all/accounting/selling/sales_order.ts` | Server Action |
| 89 | ACCOUNTING | `getSalesOrders` | `` | `./app/actions/handson/all/accounting/selling/sales_order.ts` | Server Action |
| 90 | ACCOUNTING | `getSalesPartners` | `` | `./app/actions/handson/all/accounting/selling/extras.ts` | Server Action |
| 91 | ACCOUNTING | `getSerialNos` | `` | `./app/actions/handson/all/accounting/inventory/batch_serial.ts` | Server Action |
| 92 | ACCOUNTING | `getShipments` | `` | `./app/actions/handson/all/accounting/inventory/logistics.ts` | Server Action |
| 93 | ACCOUNTING | `getShippingRules` | `` | `./app/actions/handson/all/accounting/selling/extras.ts` | Server Action |
| 94 | ACCOUNTING | `getShopFloorItems` | `doctype: string` | `./app/actions/handson/all/accounting/manufacturing/shop_floor.ts` | Server Action |
| 95 | ACCOUNTING | `getStockLedgerEntries` | `` | `./app/actions/handson/all/accounting/inventory/stock.ts` | Server Action |
| 96 | ACCOUNTING | `getStockReconciliations` | `` | `./app/actions/handson/all/accounting/inventory/stock.ts` | Server Action |
| 97 | ACCOUNTING | `getSubcontractingOrders` | `` | `./app/actions/handson/all/accounting/buying/subcontracting.ts` | Server Action |
| 98 | ACCOUNTING | `getSubcontractingReceipts` | `` | `./app/actions/handson/all/accounting/buying/subcontracting.ts` | Server Action |
| 99 | ACCOUNTING | `getSupplierQuotations` | `` | `./app/actions/handson/all/accounting/buying/supplier.ts` | Server Action |
| 100 | ACCOUNTING | `getSupplierScorecards` | `` | `./app/actions/handson/all/accounting/buying/supplier.ts` | Server Action |
| 101 | ACCOUNTING | `getSuppliers` | `` | `./app/actions/handson/all/accounting/buying/supplier.ts` | Server Action |
| 102 | ACCOUNTING | `getWarehouses` | `` | `./app/actions/handson/all/accounting/inventory/stock.ts` | Server Action |
| 103 | ACCOUNTING | `getWorkOrder` | `id: string` | `./app/actions/handson/all/accounting/manufacturing/work_order.ts` | Server Action |
| 104 | ACCOUNTING | `getWorkOrders` | `` | `./app/actions/handson/all/accounting/manufacturing/work_order.ts` | Server Action |
| 105 | ACCOUNTING | `updateAsset` | `name: string, data: Partial<AssetData>` | `./app/actions/handson/all/accounting/assets/updateAsset.ts` | Server Action |
| 106 | ACCOUNTING | `updateClearanceDate` | `doctype: "Payment Entry" \| "Journal Entry", name: string, date: string` | `./app/actions/handson/all/accounting/payments/updateClearanceDate.ts` | Server Action |
| 107 | ACCOUNTING | `updateInvoice` | `name: string, data: Partial<InvoiceData>` | `./app/actions/handson/all/accounting/invoices/updateInvoice.ts` | Server Action |
| 108 | ACCOUNTING | `updateItem` | `item_code: string, data: Partial<ItemData>` | `./app/actions/handson/all/accounting/inventory/item.ts` | Server Action |
| 109 | ACCOUNTING | `updatePurchaseOrder` | `name: string, data: Partial<PurchaseOrderData>` | `./app/actions/handson/all/accounting/buying/order.ts` | Server Action |
| 110 | ACCOUNTING | `updateQuotation` | `name: string, data: Partial<QuotationData>` | `./app/actions/handson/all/accounting/selling/quotation.ts` | Server Action |
| 111 | AI-ADMIN | `countUsers` | `data: { modelId?: string } = {}` | `./app/actions/ai/admin.ts` | Server Action |
| 112 | AI-ADMIN | `getSystemHealth` | `data: { modelId?: string } = {}` | `./app/actions/ai/admin.ts` | Server Action |
| 113 | AI-ADMIN | `getUsers` | `data: { query?: string, modelId?: string } = {}` | `./app/actions/ai/admin.ts` | Server Action |
| 114 | AI-COMPETITOR | `analyzeAiCompetitor` | `data: { name: string; modelId?: string }` | `./app/actions/ai/competitor.ts` | Server Action |
| 115 | AI-COMPETITOR | `createAiCompetitor` | `data: { name: string; industry?: string; threat_level?: string; latitude?: number; longitude?: number; website?: string; modelId?: string }` | `./app/actions/ai/competitor.ts` | Server Action |
| 116 | AI-COMPETITOR | `getAiCompetitors` | `data: { modelId?: string } = {}` | `./app/actions/ai/competitor.ts` | Server Action |
| 117 | AI-CONTROL | `broadcastAnnouncement` | `data: { subject: string, message: string, modelId?: string }` | `./app/actions/ai/control.ts` | Server Action |
| 118 | AI-CONTROL | `getGlobalSettings` | `data: { modelId?: string } = {}` | `./app/actions/ai/control.ts` | Server Action |
| 119 | AI-CREATE | `createAiNote` | `data: { title: string; description?: string; modelId?: string }` | `./app/actions/ai/create.ts` | Server Action |
| 120 | AI-CREATE | `createAiProject` | `data: { name: string; description?: string; modelId?: string }` | `./app/actions/ai/create.ts` | Server Action |
| 121 | AI-CREATE | `createAiTask` | `data: { name: string; priority?: string; end_date?: string; project?: string; assignee?: string; modelId?: string }` | `./app/actions/ai/create.ts` | Server Action |
| 122 | AI-CRM | `createAiLead` | `data: { lead_name: string; organization?: string; email_id?: string; mobile_no?: string; id_number?: string; modelId?: string }` | `./app/actions/ai/crm.ts` | Server Action |
| 123 | AI-CRM | `getCommunicationLogs` | `data: { query?: string, modelId?: string } = {}` | `./app/actions/ai/crm.ts` | Server Action |
| 124 | AI-CRM | `getCustomers` | `data: { query?: string; modelId?: string } = {}` | `./app/actions/ai/crm.ts` | Server Action |
| 125 | AI-CRM | `getMyDeals` | `data: { modelId?: string } = {}` | `./app/actions/ai/crm.ts` | Server Action |
| 126 | AI-CRM | `getMyLeads` | `data: { modelId?: string } = {}` | `./app/actions/ai/crm.ts` | Server Action |
| 127 | AI-CRM | `updateAiLead` | `data: { name: string; kyc_status?: "Pending" \| "Verified" \| "Rejected"; id_number?: string; modelId?: string }` | `./app/actions/ai/crm.ts` | Server Action |
| 128 | AI-FINANCIALS | `getPendingPayments` | `data: { modelId?: string } = {}` | `./app/actions/ai/financials.ts` | Server Action |
| 129 | AI-FINANCIALS | `getPurchaseInvoices` | `data: { modelId?: string } = {}` | `./app/actions/ai/financials.ts` | Server Action |
| 130 | AI-FINANCIALS | `getSalesInvoices` | `data: { modelId?: string } = {}` | `./app/actions/ai/financials.ts` | Server Action |
| 131 | AI-HOLIDAY | `announceHolidayWork` | `{ holiday, audience, departments }: HolidayWorkInput` | `./app/actions/ai/holiday.ts` | Server Action |
| 132 | AI-HOLIDAY | `checkUpcomingHoliday` | `` | `./app/actions/ai/holiday.ts` | Server Action |
| 133 | AI-HR | `applyAiLeave` | `data: { leave_type: string; from_date: string; to_date: string; reason?: string; modelId?: string }` | `./app/actions/ai/hr.ts` | Server Action |
| 134 | AI-HR | `checkHrRole` | `data: { modelId?: string } = {}` | `./app/actions/ai/hr.ts` | Server Action |
| 135 | AI-HR | `createAiEmployeeAdvance` | `data: { amount: number; purpose: string; modelId?: string }` | `./app/actions/ai/hr.ts` | Server Action |
| 136 | AI-HR | `createAiExpenseClaim` | `data: { description: string; amount: number; currency?: string; attachment_url?: string; modelId?: string }` | `./app/actions/ai/hr.ts` | Server Action |
| 137 | AI-HR | `createAiGoal` | `data: { description: string; start_date?: string; end_date?: string; modelId?: string }` | `./app/actions/ai/hr.ts` | Server Action |
| 138 | AI-HR | `createAssetRequest` | `data: { item_name: string; reason: string; modelId?: string }` | `./app/actions/ai/hr.ts` | Server Action |
| 139 | AI-HR | `getAiExpenses` | `data: { modelId?: string } = {}` | `./app/actions/ai/hr.ts` | Server Action |
| 140 | AI-HR | `getAiGoals` | `data: { modelId?: string } = {}` | `./app/actions/ai/hr.ts` | Server Action |
| 141 | AI-HR | `getAiPayslips` | `data: { modelId?: string } = {}` | `./app/actions/ai/hr.ts` | Server Action |
| 142 | AI-HR | `getAnnouncements` | `data: { modelId?: string } = {}` | `./app/actions/ai/hr.ts` | Server Action |
| 143 | AI-HR | `getAssetItems` | `` | `./app/actions/ai/hr.ts` | Server Action |
| 144 | AI-HR | `getAttendanceStatus` | `` | `./app/actions/ai/hr.ts` | Server Action |
| 145 | AI-HR | `getLeaveBalance` | `data: { leave_type?: string; modelId?: string } = {}` | `./app/actions/ai/hr.ts` | Server Action |
| 146 | AI-HR | `getLeaveStats` | `data: { modelId?: string } = {}` | `./app/actions/ai/hr.ts` | Server Action |
| 147 | AI-HR | `getPendingApprovals` | `data: { modelId?: string } = {}` | `./app/actions/ai/hr.ts` | Server Action |
| 148 | AI-HR | `markAiAttendance` | `data: { log_type?: "IN" \| "OUT"; timestamp?: string; latitude?: number; longitude?: number; modelId?: string }` | `./app/actions/ai/hr.ts` | Server Action |
| 149 | AI-HR | `processApproval` | `data: { doctype: "Leave Application" \| "Expense Claim" \| "Material Request"; name: string; action: "Approve" \| "Reject"; comment?: string; modelId?: string }` | `./app/actions/ai/hr.ts` | Server Action |
| 150 | AI-HR | `updateAiMyProfile` | `data: { first_name?: string; last_name?: string; id_number?: string; bank_name?: string; bank_account_no?: string; bank_branch_code?: string; tax_id?: string; modelId?: string }` | `./app/actions/ai/hr.ts` | Server Action |
| 151 | AI-MEETINGS | `getMyEvents` | `data: { modelId?: string } = {}` | `./app/actions/ai/meetings.ts` | Server Action |
