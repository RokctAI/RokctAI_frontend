/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use client";

import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Users,
  Truck,
  FileText,
  Settings,
  BarChart3,
  CreditCard,
  Globe,
  Database,
  Info,
  Layers,
  Image as ImageIcon,
  MessageSquare,
  Bell,
  Share2,
  Smartphone,
  File,
  Languages,
  RotateCcw,
  List,
  Tags,
  Star,
  Utensils,
  Box,
  Map as MapIcon,
  Wallet,
  Mail,
  DollarSign,
  Calendar,
  Flag,
  Percent,
  Gift,
  ChevronRight,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import t from "@/app/lib/i18n";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: t("nav.admin.dashboard"),
    url: "/paas/admin",
    icon: LayoutDashboard,
  },
  {
    title: t("nav.admin.product_mgmt"),
    icon: ShoppingBag,
    items: [
      { title: t("nav.admin.products"), url: "/paas/admin/products" },
      {
        title: t("nav.admin.categories"),
        url: "/paas/admin/products/categories",
      },
      { title: t("nav.admin.extras"), url: "/paas/admin/products/extras" },
      { title: t("nav.admin.recipes"), url: "/paas/admin/products/receipts" },
      {
        title: t("nav.admin.product_reviews"),
        url: "/paas/admin/products/reviews",
      },
    ],
  },
  {
    title: t("nav.admin.order_mgmt"),
    icon: List,
    items: [
      { title: t("nav.admin.all_orders"), url: "/paas/admin/orders" },
      { title: t("nav.admin.parcel_orders"), url: "/paas/admin/orders/parcel" },
      {
        title: t("nav.admin.scheduled_orders"),
        url: "/paas/admin/orders/scheduled",
      },
      {
        title: t("nav.admin.order_reviews"),
        url: "/paas/admin/orders/reviews",
      },
      {
        title: t("nav.admin.order_statuses"),
        url: "/paas/admin/orders/settings",
      },
    ],
  },
  {
    title: t("nav.admin.shop_mgmt"),
    icon: Store,
    items: [
      { title: t("nav.admin.shops"), url: "/paas/admin/shops" },
      {
        title: t("nav.admin.shop_categories"),
        url: "/paas/admin/shops/categories",
      },
      { title: t("nav.admin.shop_units"), url: "/paas/admin/shops/units" },
      { title: t("nav.admin.shop_reviews"), url: "/paas/admin/shops/reviews" },
      { title: t("nav.admin.shop_tags"), url: "/paas/admin/shops/tags" },
    ],
  },
  {
    title: t("nav.admin.content_mgmt"),
    icon: Layers,
    items: [
      { title: t("nav.admin.brands"), url: "/paas/admin/content/brands" },
      { title: t("nav.admin.banners"), url: "/paas/admin/content/banners" },
      { title: t("nav.admin.blogs"), url: "/paas/admin/content/blogs" },
      { title: t("nav.admin.stories"), url: "/paas/admin/content/stories" },
      { title: t("nav.admin.gallery"), url: "/paas/admin/content/gallery" },
      {
        title: t("nav.admin.notifications"),
        url: "/paas/admin/content/notifications",
      },
    ],
  },
  {
    title: t("nav.admin.delivery_mgmt"),
    icon: Truck,
    items: [
      {
        title: t("nav.admin.deliveries_list"),
        url: "/paas/admin/deliveryman/list",
      },
      {
        title: t("nav.admin.deliveries_map"),
        url: "/paas/admin/logistics/map",
      },
      {
        title: t("nav.admin.deliveryman_reviews"),
        url: "/paas/admin/deliveryman/reviews",
      },
      {
        title: t("nav.admin.deliveryman_requests"),
        url: "/paas/admin/deliveryman/requests",
      },
      {
        title: t("nav.admin.deliveryman_settings"),
        url: "/paas/admin/logistics/deliveryman-settings",
      },
      {
        title: t("nav.admin.vehicle_types"),
        url: "/paas/admin/logistics/vehicles",
      },
      {
        title: t("nav.admin.delivery_zones"),
        url: "/paas/admin/logistics/zones",
      },
    ],
  },
  {
    title: t("nav.admin.customer_mgmt"),
    icon: Users,
    items: [
      { title: t("nav.admin.users"), url: "/paas/admin/users" },
      { title: t("nav.admin.roles"), url: "/paas/admin/users/roles" },
      { title: t("nav.admin.wallets"), url: "/paas/admin/customers/wallets" },
      {
        title: t("nav.admin.platform_wallet"),
        url: "/paas/admin/business/wallet",
      },
      {
        title: t("nav.admin.subscribers"),
        url: "/paas/admin/customers/subscribers",
      },
    ],
  },
  {
    title: t("nav.admin.marketing_ads"),
    icon: Megaphone,
    items: [
      { title: t("nav.admin.ads_list"), url: "/paas/admin/marketing/ads" },
      {
        title: t("nav.admin.ads_packages"),
        url: "/paas/admin/marketing/packages",
      },
      { title: t("nav.admin.bonuses"), url: "/paas/admin/marketing/bonuses" },
      {
        title: t("nav.admin.referrals"),
        url: "/paas/admin/marketing/referrals",
      },
      {
        title: t("nav.admin.email_subscribers"),
        url: "/paas/admin/marketing/subscribers",
      },
      {
        title: t("nav.admin.cashback_rules"),
        url: "/paas/admin/marketing/cashback",
      },
    ],
  },
  {
    title: t("nav.admin.transactions"),
    icon: DollarSign,
    items: [
      {
        title: t("nav.admin.all_transactions"),
        url: "/paas/admin/finance/transactions",
      },
      {
        title: t("nav.admin.payout_requests"),
        url: "/paas/admin/finance/payouts/requests",
      },
      {
        title: t("nav.admin.shop_subscriptions"),
        url: "/paas/admin/finance/subscriptions",
      },
      {
        title: t("nav.admin.seller_payments"),
        url: "/paas/admin/customers/payments/sellers",
      },
    ],
  },
  {
    title: t("nav.admin.reports_analytics"),
    icon: BarChart3,
    items: [
      {
        title: t("nav.admin.overview_report"),
        url: "/paas/admin/reports/overview",
      },
      {
        title: t("nav.admin.products_report"),
        url: "/paas/admin/reports/products",
      },
      {
        title: t("nav.admin.orders_report"),
        url: "/paas/admin/reports/orders",
      },
      { title: t("nav.admin.stock_report"), url: "/paas/admin/reports/stock" },
      {
        title: t("nav.admin.revenue_report"),
        url: "/paas/admin/reports/revenue",
      },
    ],
  },
  {
    title: t("nav.admin.business_settings"),
    icon: Settings,
    items: [
      {
        title: t("nav.admin.general_settings"),
        url: "/paas/admin/settings/general",
      },
      {
        title: t("nav.admin.permission_settings"),
        url: "/paas/admin/settings/permissions",
      },
      {
        title: t("nav.admin.landing_page"),
        url: "/paas/admin/settings/landing",
      },
      {
        title: t("nav.admin.currencies"),
        url: "/paas/admin/settings/currencies",
      },
      {
        title: t("nav.admin.payment_methods"),
        url: "/paas/admin/settings/payments",
      },
      {
        title: t("nav.admin.payment_payloads"),
        url: "/paas/admin/business/payment-payloads",
      },
      {
        title: t("nav.admin.email_settings"),
        url: "/paas/admin/settings/email",
      },
      {
        title: t("nav.admin.notification_settings"),
        url: "/paas/admin/settings/notifications",
      },
      {
        title: t("nav.admin.social_settings"),
        url: "/paas/admin/settings/social",
      },
      { title: t("nav.admin.app_settings"), url: "/paas/admin/settings/app" },
      { title: t("nav.admin.page_setup"), url: "/paas/admin/settings/pages" },
      { title: t("nav.admin.faqs"), url: "/paas/admin/settings/faqs" },
      { title: t("nav.admin.terms"), url: "/paas/admin/settings/terms" },
      { title: t("nav.admin.privacy"), url: "/paas/admin/settings/privacy" },
      {
        title: t("nav.admin.flutter_app"),
        url: "/paas/admin/settings/flutter",
      },
    ],
  },
  {
    title: t("nav.admin.system_settings"),
    icon: Database,
    items: [
      { title: t("nav.admin.languages"), url: "/paas/admin/system/languages" },
      {
        title: t("nav.admin.translations"),
        url: "/paas/admin/system/translations",
      },
      { title: t("nav.admin.backups"), url: "/paas/admin/system/backup" },
      { title: t("nav.admin.system_update"), url: "/paas/admin/system/update" },
      { title: t("nav.admin.system_info"), url: "/paas/admin/system/info" },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("nav.admin.panel_label")}</SidebarGroupLabel>
      <SidebarMenu>
        {menuItems.map((item) =>
          item.items ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.items.some((sub) =>
                pathname.startsWith(sub.url),
              )}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === subItem.url}
                        >
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={item.title}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
