# API Endpoints (Part 5 of 6)
Total Interactions: 150

| No. | App | Endpoint | Payload / Arguments | Path | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 601 | PAAS-ADMIN-PRODUCTS.TS | `getAllProducts` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/products.ts` | Server Action |
| 602 | PAAS-ADMIN-PRODUCTS.TS | `getAllReceipts` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/products.ts` | Server Action |
| 603 | PAAS-ADMIN-REPORTS.TS | `getReportData` | `reportType: string, filters: any = {}` | `./app/actions/paas/admin/reports.ts` | Server Action |
| 604 | PAAS-ADMIN-REPORTS.TS | `getRevenueReport` | `dateRange: { from: string, to: string }` | `./app/actions/paas/admin/reports.ts` | Server Action |
| 605 | PAAS-ADMIN-SETTINGS.TS | `createFlutterAppConfig` | `settings: any` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 606 | PAAS-ADMIN-SETTINGS.TS | `createPrivacyPolicy` | `data: any` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 607 | PAAS-ADMIN-SETTINGS.TS | `createTerm` | `data: any` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 608 | PAAS-ADMIN-SETTINGS.TS | `deletePrivacyPolicy` | `name: string` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 609 | PAAS-ADMIN-SETTINGS.TS | `deleteTerm` | `name: string` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 610 | PAAS-ADMIN-SETTINGS.TS | `getAppSettings` | `` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 611 | PAAS-ADMIN-SETTINGS.TS | `getAvailableSourceProjects` | `` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 612 | PAAS-ADMIN-SETTINGS.TS | `getCurrencies` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 613 | PAAS-ADMIN-SETTINGS.TS | `getEmailSettings` | `` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 614 | PAAS-ADMIN-SETTINGS.TS | `getFlutterAppConfig` | `name: string` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 615 | PAAS-ADMIN-SETTINGS.TS | `getFlutterAppSettings` | `` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 616 | PAAS-ADMIN-SETTINGS.TS | `getFlutterBuildSettings` | `` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 617 | PAAS-ADMIN-SETTINGS.TS | `getGeneralSettings` | `` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 618 | PAAS-ADMIN-SETTINGS.TS | `getLandingPage` | `` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 619 | PAAS-ADMIN-SETTINGS.TS | `getNotificationSettings` | `` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 620 | PAAS-ADMIN-SETTINGS.TS | `getPages` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 621 | PAAS-ADMIN-SETTINGS.TS | `getPaymentGateway` | `name: string` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 622 | PAAS-ADMIN-SETTINGS.TS | `getPaymentMethods` | `` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 623 | PAAS-ADMIN-SETTINGS.TS | `getPermissionSettings` | `` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 624 | PAAS-ADMIN-SETTINGS.TS | `getPrivacyPolicies` | `` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 625 | PAAS-ADMIN-SETTINGS.TS | `getSocialSettings` | `` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 626 | PAAS-ADMIN-SETTINGS.TS | `getSystemInfo` | `` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 627 | PAAS-ADMIN-SETTINGS.TS | `getTerms` | `` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 628 | PAAS-ADMIN-SETTINGS.TS | `savePaymentGateway` | `doc: any` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 629 | PAAS-ADMIN-SETTINGS.TS | `updateFlutterAppSettings` | `name: string, settings: any` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 630 | PAAS-ADMIN-SETTINGS.TS | `updateFlutterBuildSettings` | `settings: any` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 631 | PAAS-ADMIN-SETTINGS.TS | `updateGeneralSettings` | `settings: any` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 632 | PAAS-ADMIN-SETTINGS.TS | `updateLandingPage` | `data: any` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 633 | PAAS-ADMIN-SETTINGS.TS | `updatePaymentMethod` | `name: string, enabled: boolean` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 634 | PAAS-ADMIN-SETTINGS.TS | `updatePermissionSettings` | `settings: any` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 635 | PAAS-ADMIN-SETTINGS.TS | `updatePrivacyPolicy` | `name: string, data: any` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 636 | PAAS-ADMIN-SETTINGS.TS | `updateTerm` | `name: string, data: any` | `./app/actions/paas/admin/settings.ts` | Server Action |
| 637 | PAAS-ADMIN-SHOPS.TS | `createShop` | `data: any` | `./app/actions/paas/admin/shops.ts` | Server Action |
| 638 | PAAS-ADMIN-SHOPS.TS | `deleteShop` | `name: string` | `./app/actions/paas/admin/shops.ts` | Server Action |
| 639 | PAAS-ADMIN-SHOPS.TS | `getShopCategories` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/shops.ts` | Server Action |
| 640 | PAAS-ADMIN-SHOPS.TS | `getShopReviews` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/shops.ts` | Server Action |
| 641 | PAAS-ADMIN-SHOPS.TS | `getShopTags` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/shops.ts` | Server Action |
| 642 | PAAS-ADMIN-SHOPS.TS | `getShopTypes` | `` | `./app/actions/paas/admin/shops.ts` | Server Action |
| 643 | PAAS-ADMIN-SHOPS.TS | `getShopUnits` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/shops.ts` | Server Action |
| 644 | PAAS-ADMIN-SHOPS.TS | `getShops` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/shops.ts` | Server Action |
| 645 | PAAS-ADMIN-SHOPS.TS | `updateShop` | `name: string, data: any` | `./app/actions/paas/admin/shops.ts` | Server Action |
| 646 | PAAS-ADMIN-SUPPORT.TS | `deleteReview` | `name: string` | `./app/actions/paas/admin/support.ts` | Server Action |
| 647 | PAAS-ADMIN-SUPPORT.TS | `getNotifications` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/support.ts` | Server Action |
| 648 | PAAS-ADMIN-SUPPORT.TS | `getReviews` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/support.ts` | Server Action |
| 649 | PAAS-ADMIN-SUPPORT.TS | `getTickets` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/support.ts` | Server Action |
| 650 | PAAS-ADMIN-SUPPORT.TS | `updateTicket` | `name: string, data: any` | `./app/actions/paas/admin/support.ts` | Server Action |
| 651 | PAAS-ADMIN-SYSTEM.TS | `clearCache` | `` | `./app/actions/paas/admin/system.ts` | Server Action |
| 652 | PAAS-ADMIN-SYSTEM.TS | `createBackup` | `` | `./app/actions/paas/admin/system.ts` | Server Action |
| 653 | PAAS-ADMIN-SYSTEM.TS | `getBackups` | `` | `./app/actions/paas/admin/system.ts` | Server Action |
| 654 | PAAS-ADMIN-SYSTEM.TS | `getLanguages` | `` | `./app/actions/paas/admin/system.ts` | Server Action |
| 655 | PAAS-ADMIN-SYSTEM.TS | `getSystemInfo` | `` | `./app/actions/paas/admin/system.ts` | Server Action |
| 656 | PAAS-ADMIN-SYSTEM.TS | `getTranslations` | `` | `./app/actions/paas/admin/system.ts` | Server Action |
| 657 | PAAS-ADMIN-SYSTEM.TS | `triggerSystemUpdate` | `` | `./app/actions/paas/admin/system.ts` | Server Action |
| 658 | PAAS-ADMIN-SYSTEM.TS | `updateTranslation` | `name: string, value: string` | `./app/actions/paas/admin/system.ts` | Server Action |
| 659 | PAAS-ADMIN-TRANSACTIONS.TS | `getPayoutRequests` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/transactions.ts` | Server Action |
| 660 | PAAS-ADMIN-TRANSACTIONS.TS | `getPayouts` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/transactions.ts` | Server Action |
| 661 | PAAS-ADMIN-TRANSACTIONS.TS | `getShopSubscriptions` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/transactions.ts` | Server Action |
| 662 | PAAS-ADMIN-TRANSACTIONS.TS | `getTransactions` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/transactions.ts` | Server Action |
| 663 | PAAS-ADMIN-TRANSACTIONS.TS | `updatePayoutRequest` | `name: string, status: string` | `./app/actions/paas/admin/transactions.ts` | Server Action |
| 664 | PAAS-ADMIN-USERS.TS | `getPoints` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/users.ts` | Server Action |
| 665 | PAAS-ADMIN-USERS.TS | `getReferrals` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/users.ts` | Server Action |
| 666 | PAAS-ADMIN-USERS.TS | `getRoles` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/users.ts` | Server Action |
| 667 | PAAS-ADMIN-USERS.TS | `getUsers` | `page: number = 1, limit: number = 20` | `./app/actions/paas/admin/users.ts` | Server Action |
| 668 | PAAS-BOOKING.TS | `createShopSection` | `data: any` | `./app/actions/paas/booking.ts` | Server Action |
| 669 | PAAS-BOOKING.TS | `createTable` | `data: any` | `./app/actions/paas/booking.ts` | Server Action |
| 670 | PAAS-BOOKING.TS | `deleteShopSection` | `name: string` | `./app/actions/paas/booking.ts` | Server Action |
| 671 | PAAS-BOOKING.TS | `deleteTable` | `name: string` | `./app/actions/paas/booking.ts` | Server Action |
| 672 | PAAS-BOOKING.TS | `getReservation` | `name: string` | `./app/actions/paas/booking.ts` | Server Action |
| 673 | PAAS-BOOKING.TS | `getReservations` | `status?: string, dateFrom?: string, dateTo?: string` | `./app/actions/paas/booking.ts` | Server Action |
| 674 | PAAS-BOOKING.TS | `getShopSections` | `` | `./app/actions/paas/booking.ts` | Server Action |
| 675 | PAAS-BOOKING.TS | `getTables` | `sectionId: string` | `./app/actions/paas/booking.ts` | Server Action |
| 676 | PAAS-BOOKING.TS | `updateReservationStatus` | `name: string, status: string` | `./app/actions/paas/booking.ts` | Server Action |
| 677 | PAAS-BOOKING.TS | `updateShopSection` | `name: string, data: any` | `./app/actions/paas/booking.ts` | Server Action |
| 678 | PAAS-BOOKING.TS | `updateTable` | `name: string, data: any` | `./app/actions/paas/booking.ts` | Server Action |
| 679 | PAAS-BRANCHES.TS | `createBranch` | `data: any` | `./app/actions/paas/branches.ts` | Server Action |
| 680 | PAAS-BRANCHES.TS | `deleteBranch` | `id: string` | `./app/actions/paas/branches.ts` | Server Action |
| 681 | PAAS-BRANCHES.TS | `getBranches` | `` | `./app/actions/paas/branches.ts` | Server Action |
| 682 | PAAS-BRANCHES.TS | `updateBranch` | `id: string, data: any` | `./app/actions/paas/branches.ts` | Server Action |
| 683 | PAAS-BRANDS.TS | `createBrand` | `data: any` | `./app/actions/paas/brands.ts` | Server Action |
| 684 | PAAS-BRANDS.TS | `deleteBrand` | `uuid: string` | `./app/actions/paas/brands.ts` | Server Action |
| 685 | PAAS-BRANDS.TS | `getBrands` | `` | `./app/actions/paas/brands.ts` | Server Action |
| 686 | PAAS-BRANDS.TS | `updateBrand` | `uuid: string, data: any` | `./app/actions/paas/brands.ts` | Server Action |
| 687 | PAAS-BUSINESS.TS | `getAdsPackages` | `` | `./app/actions/paas/business.ts` | Server Action |
| 688 | PAAS-BUSINESS.TS | `getMyShopSubscription` | `` | `./app/actions/paas/business.ts` | Server Action |
| 689 | PAAS-BUSINESS.TS | `getPurchasedAds` | `` | `./app/actions/paas/business.ts` | Server Action |
| 690 | PAAS-BUSINESS.TS | `getSubscriptions` | `` | `./app/actions/paas/business.ts` | Server Action |
| 691 | PAAS-BUSINESS.TS | `purchaseAdsPackage` | `packageName: string` | `./app/actions/paas/business.ts` | Server Action |
| 692 | PAAS-BUSINESS.TS | `subscribeMyShop` | `subscriptionId: string` | `./app/actions/paas/business.ts` | Server Action |
| 693 | PAAS-CATEGORIES.TS | `createCategory` | `data: any` | `./app/actions/paas/categories.ts` | Server Action |
| 694 | PAAS-CATEGORIES.TS | `deleteCategory` | `id: string` | `./app/actions/paas/categories.ts` | Server Action |
| 695 | PAAS-CATEGORIES.TS | `getCategories` | `` | `./app/actions/paas/categories.ts` | Server Action |
| 696 | PAAS-CATEGORIES.TS | `updateCategory` | `id: string, data: any` | `./app/actions/paas/categories.ts` | Server Action |
| 697 | PAAS-CUSTOMERS.TS | `getCustomerDetails` | `customerId: string` | `./app/actions/paas/customers.ts` | Server Action |
| 698 | PAAS-CUSTOMERS.TS | `getCustomers` | `page: number = 1, perPage: number = 20` | `./app/actions/paas/customers.ts` | Server Action |
| 699 | PAAS-DASHBOARD.TS | `getDashboardStats` | `` | `./app/actions/paas/dashboard.ts` | Server Action |
| 700 | PAAS-DELIVERY-ZONES.TS | `checkDeliveryFee` | `lat: number, lng: number` | `./app/actions/paas/delivery-zones.ts` | Server Action |
| 701 | PAAS-DELIVERY-ZONES.TS | `createDeliveryZone` | `data: any` | `./app/actions/paas/delivery-zones.ts` | Server Action |
| 702 | PAAS-DELIVERY-ZONES.TS | `deleteDeliveryZone` | `name: string` | `./app/actions/paas/delivery-zones.ts` | Server Action |
| 703 | PAAS-DELIVERY-ZONES.TS | `getDeliveryZones` | `` | `./app/actions/paas/delivery-zones.ts` | Server Action |
| 704 | PAAS-DELIVERY.TS | `getDeliveryOrders` | `page: number = 1, limit: number = 20` | `./app/actions/paas/delivery.ts` | Server Action |
| 705 | PAAS-DELIVERY.TS | `getDeliverySettings` | `` | `./app/actions/paas/delivery.ts` | Server Action |
| 706 | PAAS-DELIVERY.TS | `getDeliveryStatistics` | `` | `./app/actions/paas/delivery.ts` | Server Action |
| 707 | PAAS-DELIVERY.TS | `getDeliveryZones` | `` | `./app/actions/paas/delivery.ts` | Server Action |
| 708 | PAAS-DELIVERY.TS | `getParcelOrders` | `page: number = 1, limit: number = 20` | `./app/actions/paas/delivery.ts` | Server Action |
| 709 | PAAS-DELIVERY.TS | `getPayouts` | `page: number = 1, limit: number = 20` | `./app/actions/paas/delivery.ts` | Server Action |
| 710 | PAAS-DELIVERY.TS | `updateDeliverySettings` | `settings: any` | `./app/actions/paas/delivery.ts` | Server Action |
| 711 | PAAS-EXTRAS.TS | `createExtraGroup` | `data: any` | `./app/actions/paas/extras.ts` | Server Action |
| 712 | PAAS-EXTRAS.TS | `createExtraValue` | `data: any` | `./app/actions/paas/extras.ts` | Server Action |
| 713 | PAAS-EXTRAS.TS | `deleteExtraGroup` | `name: string` | `./app/actions/paas/extras.ts` | Server Action |
| 714 | PAAS-EXTRAS.TS | `deleteExtraValue` | `name: string` | `./app/actions/paas/extras.ts` | Server Action |
| 715 | PAAS-EXTRAS.TS | `getExtraGroups` | `` | `./app/actions/paas/extras.ts` | Server Action |
| 716 | PAAS-EXTRAS.TS | `getExtraValues` | `groupId: string` | `./app/actions/paas/extras.ts` | Server Action |
| 717 | PAAS-EXTRAS.TS | `updateExtraGroup` | `name: string, data: any` | `./app/actions/paas/extras.ts` | Server Action |
| 718 | PAAS-FINANCE.TS | `getPartnerPayments` | `` | `./app/actions/paas/finance.ts` | Server Action |
| 719 | PAAS-FINANCE.TS | `getPayouts` | `` | `./app/actions/paas/finance.ts` | Server Action |
| 720 | PAAS-FINANCE.TS | `getShopPayments` | `` | `./app/actions/paas/finance.ts` | Server Action |
| 721 | PAAS-FINANCE.TS | `getTransactions` | `` | `./app/actions/paas/finance.ts` | Server Action |
| 722 | PAAS-FINANCE.TS | `getWallet` | `` | `./app/actions/paas/finance.ts` | Server Action |
| 723 | PAAS-FINANCE.TS | `getWalletHistory` | `` | `./app/actions/paas/finance.ts` | Server Action |
| 724 | PAAS-FINANCE.TS | `topUpWallet` | `amount: number` | `./app/actions/paas/finance.ts` | Server Action |
| 725 | PAAS-GALLERY.TS | `addGalleryImage` | `data: any` | `./app/actions/paas/gallery.ts` | Server Action |
| 726 | PAAS-GALLERY.TS | `deleteGalleryImage` | `name: string` | `./app/actions/paas/gallery.ts` | Server Action |
| 727 | PAAS-GALLERY.TS | `getGalleryImages` | `` | `./app/actions/paas/gallery.ts` | Server Action |
| 728 | PAAS-INVITES.TS | `getSellerInvites` | `` | `./app/actions/paas/invites.ts` | Server Action |
| 729 | PAAS-INVITES.TS | `updateInviteStatus` | `inviteId: string, status: "Accepted" \| "Rejected"` | `./app/actions/paas/invites.ts` | Server Action |
| 730 | PAAS-MARKETING.TS | `createCoupon` | `data: any` | `./app/actions/paas/marketing.ts` | Server Action |
| 731 | PAAS-MARKETING.TS | `deleteCoupon` | `name: string` | `./app/actions/paas/marketing.ts` | Server Action |
| 732 | PAAS-MARKETING.TS | `getBonuses` | `` | `./app/actions/paas/marketing.ts` | Server Action |
| 733 | PAAS-MARKETING.TS | `getCoupons` | `` | `./app/actions/paas/marketing.ts` | Server Action |
| 734 | PAAS-MARKETING.TS | `updateCoupon` | `name: string, data: any` | `./app/actions/paas/marketing.ts` | Server Action |
| 735 | PAAS-OPERATIONS.TS | `createCombo` | `data: any` | `./app/actions/paas/operations.ts` | Server Action |
| 736 | PAAS-OPERATIONS.TS | `createKitchen` | `data: any` | `./app/actions/paas/operations.ts` | Server Action |
| 737 | PAAS-OPERATIONS.TS | `createMenu` | `data: any` | `./app/actions/paas/operations.ts` | Server Action |
| 738 | PAAS-OPERATIONS.TS | `deleteCombo` | `name: string` | `./app/actions/paas/operations.ts` | Server Action |
| 739 | PAAS-OPERATIONS.TS | `deleteKitchen` | `name: string` | `./app/actions/paas/operations.ts` | Server Action |
| 740 | PAAS-OPERATIONS.TS | `deleteMenu` | `name: string` | `./app/actions/paas/operations.ts` | Server Action |
| 741 | PAAS-OPERATIONS.TS | `getCombos` | `` | `./app/actions/paas/operations.ts` | Server Action |
| 742 | PAAS-OPERATIONS.TS | `getKitchens` | `` | `./app/actions/paas/operations.ts` | Server Action |
| 743 | PAAS-OPERATIONS.TS | `getMenus` | `` | `./app/actions/paas/operations.ts` | Server Action |
| 744 | PAAS-OPERATIONS.TS | `updateKitchen` | `name: string, data: any` | `./app/actions/paas/operations.ts` | Server Action |
| 745 | PAAS-ORDERS.TS | `getOrder` | `id: string` | `./app/actions/paas/orders.ts` | Server Action |
| 746 | PAAS-ORDERS.TS | `getOrders` | `page: number = 1, perPage: number = 20, status?: string` | `./app/actions/paas/orders.ts` | Server Action |
| 747 | PAAS-ORDERS.TS | `updateOrderStatus` | `id: string, status: string` | `./app/actions/paas/orders.ts` | Server Action |
| 748 | PAAS-PARCEL.TS | `createParcelSetting` | `data: any` | `./app/actions/paas/parcel.ts` | Server Action |
| 749 | PAAS-PARCEL.TS | `deleteParcelSetting` | `name: string` | `./app/actions/paas/parcel.ts` | Server Action |
| 750 | PAAS-PARCEL.TS | `getParcelOrder` | `name: string` | `./app/actions/paas/parcel.ts` | Server Action |

## Documentation Parts
- `endpoints_part1.md`: 1-150
- `endpoints_part2.md`: 151-300
- `endpoints_part3.md`: 301-450
- `endpoints_part4.md`: 451-600
- `endpoints_part5.md`: 601-750
- `endpoints_part6.md`: 751-897