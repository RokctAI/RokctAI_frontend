# API Endpoints (Part 6 of 6)

| No. | App | Endpoint | Payload / Arguments | Path | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 756 | PAAS-PARCEL.TS | `getParcelSettings` | `` | `./app/actions/paas/parcel.ts` | Server Action |
| 757 | PAAS-PARCEL.TS | `updateParcelSetting` | `name: string, data: any` | `./app/actions/paas/parcel.ts` | Server Action |
| 758 | PAAS-PARCEL.TS | `updateParcelStatus` | `name: string, status: string` | `./app/actions/paas/parcel.ts` | Server Action |
| 759 | PAAS-POS.TS | `createPOSOrder` | `orderData: any` | `./app/actions/paas/pos.ts` | Server Action |
| 760 | PAAS-PRODUCTS.TS | `adjustInventory` | `itemCode: string, warehouse: string, newQty: number` | `./app/actions/paas/products.ts` | Server Action |
| 761 | PAAS-PRODUCTS.TS | `createProduct` | `data: any` | `./app/actions/paas/products.ts` | Server Action |
| 762 | PAAS-PRODUCTS.TS | `deleteProduct` | `name: string` | `./app/actions/paas/products.ts` | Server Action |
| 763 | PAAS-PRODUCTS.TS | `getInventory` | `itemCode: string` | `./app/actions/paas/products.ts` | Server Action |
| 764 | PAAS-PRODUCTS.TS | `getProduct` | `name: string` | `./app/actions/paas/products.ts` | Server Action |
| 765 | PAAS-PRODUCTS.TS | `getProducts` | `page: number = 1, perPage: number = 20` | `./app/actions/paas/products.ts` | Server Action |
| 766 | PAAS-PRODUCTS.TS | `updateProduct` | `name: string, data: any` | `./app/actions/paas/products.ts` | Server Action |
| 767 | PAAS-RECEIPTS.TS | `getReceiptDetails` | `id: string` | `./app/actions/paas/receipts.ts` | Server Action |
| 768 | PAAS-RECEIPTS.TS | `getReceipts` | `` | `./app/actions/paas/receipts.ts` | Server Action |
| 769 | PAAS-REFUNDS.TS | `getRefunds` | `` | `./app/actions/paas/refunds.ts` | Server Action |
| 770 | PAAS-REFUNDS.TS | `getReviews` | `` | `./app/actions/paas/refunds.ts` | Server Action |
| 771 | PAAS-REFUNDS.TS | `updateRefund` | `refundId: string, status: string, answer?: string` | `./app/actions/paas/refunds.ts` | Server Action |
| 772 | PAAS-REPORTS.TS | `getOrderReport` | `fromDate?: string, toDate?: string` | `./app/actions/paas/reports.ts` | Server Action |
| 773 | PAAS-REPORTS.TS | `getSellerStatistics` | `` | `./app/actions/paas/reports.ts` | Server Action |
| 774 | PAAS-SHOP.TS | `getShop` | `` | `./app/actions/paas/shop.ts` | Server Action |
| 775 | PAAS-SHOP.TS | `getShops` | `` | `./app/actions/paas/shop.ts` | Server Action |
| 776 | PAAS-SHOP.TS | `setWorkingStatus` | `status: boolean` | `./app/actions/paas/shop.ts` | Server Action |
| 777 | PAAS-SHOP.TS | `updateShop` | `data: any` | `./app/actions/paas/shop.ts` | Server Action |
| 778 | PAAS-STAFF.TS | `getCooks` | `` | `./app/actions/paas/staff.ts` | Server Action |
| 779 | PAAS-STAFF.TS | `getDeliveryMen` | `` | `./app/actions/paas/staff.ts` | Server Action |
| 780 | PAAS-STAFF.TS | `getWaiters` | `` | `./app/actions/paas/staff.ts` | Server Action |
| 781 | PAAS-STORIES.TS | `createStory` | `data: any` | `./app/actions/paas/stories.ts` | Server Action |
| 782 | PAAS-STORIES.TS | `deleteStory` | `id: string` | `./app/actions/paas/stories.ts` | Server Action |
| 783 | PAAS-STORIES.TS | `getStories` | `` | `./app/actions/paas/stories.ts` | Server Action |
| 784 | PAAS-UPLOAD.TS | `uploadFile` | `formData: FormData` | `./app/actions/paas/upload.ts` | Server Action |
| 785 | PAAS-WHATSAPP.TS | `getWhatsAppConfig` | `` | `./app/actions/paas/whatsapp.ts` | Server Action |
| 786 | PAAS-WHATSAPP.TS | `updateWhatsAppConfig` | `data: any` | `./app/actions/paas/whatsapp.ts` | Server Action |
| 787 | PAAS-WORKING-HOURS.TS | `getWorkingHours` | `` | `./app/actions/paas/working-hours.ts` | Server Action |
| 788 | PAAS-WORKING-HOURS.TS | `updateWorkingHours` | `data: any` | `./app/actions/paas/working-hours.ts` | Server Action |
| 789 | PROJECTS | `cloneProject` | `projectId: string, newName: string` | `./app/actions/handson/all/projects/cloning.ts` | Server Action |
| 790 | PROJECTS | `createActivityType` | `data: any` | `./app/actions/handson/all/projects/timesheets.ts` | Server Action |
| 791 | PROJECTS | `createKPI` | `data: any` | `./app/actions/handson/all/projects/strategy/kpi.ts` | Server Action |
| 792 | PROJECTS | `createMyTimesheet` | `data: any` | `./app/actions/handson/all/projects/me/timesheets.ts` | Server Action |
| 793 | PROJECTS | `createPersonalMasteryGoal` | `data: any` | `./app/actions/handson/all/projects/strategy/mastery.ts` | Server Action |
| 794 | PROJECTS | `createPillar` | `data: any` | `./app/actions/handson/all/projects/strategy/pillar.ts` | Server Action |
| 795 | PROJECTS | `createProject` | `data: ProjectData` | `./app/actions/handson/all/projects/projects.ts` | Server Action |
| 796 | PROJECTS | `createStrategicObjective` | `data: any` | `./app/actions/handson/all/projects/strategy/objective.ts` | Server Action |
| 797 | PROJECTS | `createTask` | `data: any` | `./app/actions/handson/all/projects/tasks.ts` | Server Action |
| 798 | PROJECTS | `createTimesheet` | `data: any` | `./app/actions/handson/all/projects/timesheets.ts` | Server Action |
| 799 | PROJECTS | `createVision` | `data: any` | `./app/actions/handson/all/projects/strategy/vision.ts` | Server Action |
| 800 | PROJECTS | `deleteKPI` | `name: string` | `./app/actions/handson/all/projects/strategy/kpi.ts` | Server Action |
| 801 | PROJECTS | `deletePersonalMasteryGoal` | `name: string` | `./app/actions/handson/all/projects/strategy/mastery.ts` | Server Action |
| 802 | PROJECTS | `deletePillar` | `name: string` | `./app/actions/handson/all/projects/strategy/pillar.ts` | Server Action |
| 803 | PROJECTS | `deleteProject` | `name: string` | `./app/actions/handson/all/projects/projects.ts` | Server Action |
| 804 | PROJECTS | `deleteStrategicObjective` | `name: string` | `./app/actions/handson/all/projects/strategy/objective.ts` | Server Action |
| 805 | PROJECTS | `deleteVision` | `name: string` | `./app/actions/handson/all/projects/strategy/vision.ts` | Server Action |
| 806 | PROJECTS | `getActivityTypes` | `` | `./app/actions/handson/all/projects/timesheets.ts` | Server Action |
| 807 | PROJECTS | `getKPIs` | `objectiveName?: string` | `./app/actions/handson/all/projects/strategy/kpi.ts` | Server Action |
| 808 | PROJECTS | `getMyTasks` | `` | `./app/actions/handson/all/projects/me/tasks.ts` | Server Action |
| 809 | PROJECTS | `getMyTimesheets` | `` | `./app/actions/handson/all/projects/me/timesheets.ts` | Server Action |
| 810 | PROJECTS | `getPersonalMasteryGoals` | `` | `./app/actions/handson/all/projects/strategy/mastery.ts` | Server Action |
| 811 | PROJECTS | `getPillars` | `visionName?: string` | `./app/actions/handson/all/projects/strategy/pillar.ts` | Server Action |
| 812 | PROJECTS | `getPlanOnAPage` | `` | `./app/actions/handson/all/projects/strategy/plan.ts` | Server Action |
| 813 | PROJECTS | `getProject` | `name: string` | `./app/actions/handson/all/projects/projects.ts` | Server Action |
| 814 | PROJECTS | `getProjects` | `` | `./app/actions/handson/all/projects/projects.ts` | Server Action |
| 815 | PROJECTS | `getStrategicObjectives` | `pillarName?: string` | `./app/actions/handson/all/projects/strategy/objective.ts` | Server Action |
| 816 | PROJECTS | `getTasks` | `` | `./app/actions/handson/all/projects/tasks.ts` | Server Action |
| 817 | PROJECTS | `getTimesheets` | `` | `./app/actions/handson/all/projects/timesheets.ts` | Server Action |
| 818 | PROJECTS | `getUsers` | `` | `./app/actions/handson/all/projects/tasks.ts` | Server Action |
| 819 | PROJECTS | `getVision` | `name: string` | `./app/actions/handson/all/projects/strategy/vision.ts` | Server Action |
| 820 | PROJECTS | `getVisions` | `` | `./app/actions/handson/all/projects/strategy/vision.ts` | Server Action |
| 821 | PROJECTS | `updateKPI` | `name: string, data: any` | `./app/actions/handson/all/projects/strategy/kpi.ts` | Server Action |
| 822 | PROJECTS | `updatePersonalMasteryGoal` | `name: string, data: any` | `./app/actions/handson/all/projects/strategy/mastery.ts` | Server Action |
| 823 | PROJECTS | `updatePillar` | `name: string, data: any` | `./app/actions/handson/all/projects/strategy/pillar.ts` | Server Action |
| 824 | PROJECTS | `updatePlanOnAPage` | `data: any` | `./app/actions/handson/all/projects/strategy/plan.ts` | Server Action |
| 825 | PROJECTS | `updateProject` | `name: string, data: Partial<ProjectData>` | `./app/actions/handson/all/projects/projects.ts` | Server Action |
| 826 | PROJECTS | `updateStrategicObjective` | `name: string, data: any` | `./app/actions/handson/all/projects/strategy/objective.ts` | Server Action |
| 827 | PROJECTS | `updateVision` | `name: string, data: any` | `./app/actions/handson/all/projects/strategy/vision.ts` | Server Action |
| 828 | REPORTS | `executeReportQuery` | `sql: string` | `./app/actions/handson/all/reports/analytics.ts` | Execute a read-only SQL query on the Tenant Site. Used by Control-Managed Reports. |
| 829 | REPORTS | `getAccountBalances` | `company: string` | `./app/actions/handson/all/reports/financial.ts` | Server Action |
| 830 | REPORTS | `getStandardReports` | `` | `./app/actions/handson/all/reports/analytics.ts` | Server Action |
| 831 | REPORTS | `runCustomReport` | `doctype: string, fields: string[], filters: any = {}` | `./app/actions/handson/all/reports/analytics.ts` | Server Action |
| 832 | REPORTS | `runFinancialReport` | `reportName: string, filters: any` | `./app/actions/handson/all/reports/financial.ts` | Server Action |
| 833 | ROADMAP | `assignToJules` | `docname: string, feature: string, explanation: string` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 834 | ROADMAP | `createRoadmap` | `data: any` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 835 | ROADMAP | `createRoadmapFeature` | `data: any` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 836 | ROADMAP | `deleteRoadmap` | `name: string` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 837 | ROADMAP | `deleteRoadmapFeature` | `name: string` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 838 | ROADMAP | `discoverRoadmapContext` | `name: string` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 839 | ROADMAP | `generateOneRoadmapIdeas` | `name: string` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 840 | ROADMAP | `getGlobalSettings` | `` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 841 | ROADMAP | `getJulesActivities` | `sessionId: string, apiKey?: string` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 842 | ROADMAP | `getJulesSources` | `apiKey?: string` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 843 | ROADMAP | `getJulesStatus` | `sessionId: string, apiKey?: string` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 844 | ROADMAP | `getRoadmap` | `name: string` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 845 | ROADMAP | `getRoadmapFeatures` | `roadmapName: string` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 846 | ROADMAP | `getRoadmaps` | `` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 847 | ROADMAP | `sendJulesMessage` | `sessionId: string, message: string, apiKey?: string` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 848 | ROADMAP | `setPublicRoadmap` | `roadmapName: string \| null` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 849 | ROADMAP | `triggerJules` | `` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 850 | ROADMAP | `updateRoadmap` | `name: string, data: any` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 851 | ROADMAP | `updateRoadmapFeature` | `name: string, data: any` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 852 | ROADMAP | `voteOnPlan` | `sessionId: string, action: "approve", apiKey?: string` | `./app/actions/handson/all/roadmap/roadmap.ts` | Server Action |
| 853 | SETTINGS | `createLocationType` | `data: any` | `./app/actions/handson/all/settings/lookups.ts` | Server Action |
| 854 | SETTINGS | `createOrgan` | `data: any` | `./app/actions/handson/all/settings/lookups.ts` | Server Action |
| 855 | SETTINGS | `createProvince` | `data: any` | `./app/actions/handson/all/settings/lookups.ts` | Server Action |
| 856 | SETTINGS | `deleteLocationType` | `name: string` | `./app/actions/handson/all/settings/lookups.ts` | Server Action |
| 857 | SETTINGS | `deleteOrgan` | `name: string` | `./app/actions/handson/all/settings/lookups.ts` | Server Action |
| 858 | SETTINGS | `deleteProvince` | `name: string` | `./app/actions/handson/all/settings/lookups.ts` | Server Action |
| 859 | SETTINGS | `getCompanyDetails` | `` | `./app/actions/handson/all/settings/general.ts` | Server Action |
| 860 | SETTINGS | `getLocationTypes` | `` | `./app/actions/handson/all/settings/lookups.ts` | Server Action |
| 861 | SETTINGS | `getOrgans` | `` | `./app/actions/handson/all/settings/lookups.ts` | Server Action |
| 862 | SETTINGS | `getProvinces` | `` | `./app/actions/handson/all/settings/lookups.ts` | Server Action |
| 863 | SETTINGS | `getSystemSettings` | `` | `./app/actions/handson/all/settings/general.ts` | Server Action |
| 864 | SETTINGS | `updateCompanyDetails` | `name: string, data: any` | `./app/actions/handson/all/settings/general.ts` | Server Action |
| 865 | SETTINGS | `updateNamingSeries` | `series: string, current: number` | `./app/actions/handson/all/settings/general.ts` | Server Action |
| 866 | SETTINGS | `updateSystemSettings` | `data: any` | `./app/actions/handson/all/settings/general.ts` | Server Action |
| 867 | SETTINGS | `updateUserProfile` | `email: string, data: { first_name?: string; last_name?: string; gender?: string; birth_date?: string }` | `./app/actions/handson/all/settings/profile.ts` | Server Action |
| 868 | TENANT-ANNOUNCEMENTS | `getMyAnnouncements` | `` | `./app/actions/handson/tenant/announcements/announcements.ts` | Server Action |
| 869 | TENANT-SETTINGS | `connectIntegration` | `serviceName: string, config: any` | `./app/actions/handson/tenant/settings/integrations.ts` | Server Action |
| 870 | TENANT-SETTINGS | `createUser` | `data: { email: string; first_name: string; last_name?: string; role: UserRole }` | `./app/actions/handson/tenant/settings/users.ts` | Server Action |
| 871 | TENANT-SETTINGS | `deleteTenantTerm` | `name: string` | `./app/actions/handson/tenant/settings/terms.ts` | Server Action |
| 872 | TENANT-SETTINGS | `disconnectIntegration` | `serviceName: string` | `./app/actions/handson/tenant/settings/integrations.ts` | Server Action |
| 873 | TENANT-SETTINGS | `getAvailableMasterTerms` | `` | `./app/actions/handson/tenant/settings/terms.ts` | Fetches "Standard" (Master) terms available for import. |
| 874 | TENANT-SETTINGS | `getCompanySettings` | `` | `./app/actions/handson/tenant/settings/company.ts` | Server Action |
| 875 | TENANT-SETTINGS | `getIntegrations` | `` | `./app/actions/handson/tenant/settings/integrations.ts` | Fetches the status of all integrations. |
| 876 | TENANT-SETTINGS | `getStimulusCategories` | `` | `./app/actions/handson/tenant/settings/synaptic.ts` | Server Action |
| 877 | TENANT-SETTINGS | `getSynapticSettings` | `` | `./app/actions/handson/tenant/settings/synaptic.ts` | Server Action |
| 878 | TENANT-SETTINGS | `getTenantEmailSettings` | `` | `./app/actions/handson/tenant/settings/email.ts` | Server Action |
| 879 | TENANT-SETTINGS | `getTenantTerms` | `` | `./app/actions/handson/tenant/settings/terms.ts` | Fetches the Tenant's existing terms. |
| 880 | TENANT-SETTINGS | `getUsers` | `` | `./app/actions/handson/tenant/settings/users.ts` | Server Action |
| 881 | TENANT-SETTINGS | `importMasterTerm` | `masterName: string` | `./app/actions/handson/tenant/settings/terms.ts` | Create a LOCAL copy of a Master Term. |
| 882 | TENANT-SETTINGS | `saveTenantTerm` | `name: string \| undefined, title: string, terms: string` | `./app/actions/handson/tenant/settings/terms.ts` | Server Action |
| 883 | TENANT-SETTINGS | `updateCompanySettings` | `data: any` | `./app/actions/handson/tenant/settings/company.ts` | Server Action |
| 884 | TENANT-SETTINGS | `updateSynapticSettings` | `data: any` | `./app/actions/handson/tenant/settings/synaptic.ts` | Server Action |
| 885 | TENANT-SETTINGS | `updateTenantEmailSettings` | `data: any` | `./app/actions/handson/tenant/settings/email.ts` | Server Action |
| 886 | TENANT-SUPPORT | `getProviderTickets` | `` | `./app/actions/handson/tenant/support/support.ts` | Fetches tickets raised by this Tenant from the Control Site. We match Issue.raised_by = <Current Tenant ID/Email> or Issue.customer = <Tenant Company> |
| 887 | TENANT-SUPPORT | `submitProviderTicket` | `data: ProviderTicketData` | `./app/actions/handson/tenant/support/support.ts` | Server Action |
| 888 | TENANT-SYSTEM | `deleteApiErrorLog` | `name: string` | `./app/actions/handson/tenant/system/api_logs.ts` | Server Action |
| 889 | TENANT-SYSTEM | `getApiErrorLog` | `name: string` | `./app/actions/handson/tenant/system/api_logs.ts` | Server Action |
| 890 | TENANT-SYSTEM | `getApiErrorLogs` | `` | `./app/actions/handson/tenant/system/api_logs.ts` | Server Action |
| 891 | TENANT-SYSTEM | `getStorageUsage` | `` | `./app/actions/handson/tenant/system/storage.ts` | Server Action |
| 892 | TENANT-SYSTEM | `getSubscriptionStatus` | `` | `./app/actions/handson/tenant/system/subscriptions.ts` | Server Action |
| 893 | TENANT-SYSTEM | `getTokenUsageLogs` | `` | `./app/actions/handson/tenant/system/token_usage.ts` | Server Action |
| 894 | WORKSPACE | `addComment` | `doctype: string, docname: string, content: string` | `./app/actions/handson/all/workspace/communication.ts` | Server Action |
| 895 | WORKSPACE | `createEvent` | `data: EventData` | `./app/actions/handson/all/workspace/events.ts` | Server Action |
| 896 | WORKSPACE | `createWorkItem` | `type: WorkItemType, data: any` | `./app/actions/handson/all/workspace/dashboard.ts` | Unified action to create work items @param type 'todo' \| 'task' \| 'note' @param data The data payload depending on type |
| 897 | WORKSPACE | `deleteEvent` | `name: string` | `./app/actions/handson/all/workspace/events.ts` | Server Action |
| 898 | WORKSPACE | `getCalendarEvents` | `start?: string, end?: string` | `./app/actions/handson/all/workspace/calendar.ts` | Server Action |
| 899 | WORKSPACE | `getCommunications` | `doctype: string, docname: string` | `./app/actions/handson/all/workspace/communication.ts` | Server Action |
| 900 | WORKSPACE | `getEvents` | `filters?: any` | `./app/actions/handson/all/workspace/events.ts` | Server Action |
| 901 | WORKSPACE | `getWorkItems` | `type: WorkItemType` | `./app/actions/handson/all/workspace/dashboard.ts` | Unified action to fetch work items (Todo, Task, or Note) @param type The type of work item to fetch |
