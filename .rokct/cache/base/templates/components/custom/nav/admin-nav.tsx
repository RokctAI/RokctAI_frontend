/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
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
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: t("nav.admin.product_mgmt"),
    icon: ShoppingBag,
    items: [
      { title: t("nav.admin.products"), url: "/admin/products" },
      {
        title: t("nav.admin.categories"),
        url: "/admin/products/categories",
      },
      { title: t("nav.admin.extras"), url: "/admin/products/extras" },
      { title: t("nav.admin.recipes"), url: "/admin/products/receipts" },
      {
        title: t("nav.admin.product_reviews"),
        url: "/admin/products/reviews",
      },
    ],
  },
  {
    title: t("nav.admin.order_mgmt"),
    icon: List,
    items: [
      { title: t("nav.admin.all_orders"), url: "/admin/orders" },
      { title: t("nav.admin.parcel_orders"), url: "/admin/orders/parcel" },
      {
        title: t("nav.admin.scheduled_orders"),
        url: "/admin/orders/scheduled",
      },
      {
        title: t("nav.admin.order_reviews"),
        url: "/admin/orders/reviews",
      },
      {
        title: t("nav.admin.order_statuses"),
        url: "/admin/orders/settings",
      },
    ],
  },
  {
    title: t("nav.admin.shop_mgmt"),
    icon: Store,
    items: [
      { title: t("nav.admin.shops"), url: "/admin/shops" },
      {
        title: t("nav.admin.shop_categories"),
        url: "/admin/shops/categories",
      },
      { title: t("nav.admin.shop_units"), url: "/admin/shops/units" },
      { title: t("nav.admin.shop_reviews"), url: "/admin/shops/reviews" },
      { title: t("nav.admin.shop_tags"), url: "/admin/shops/tags" },
    ],
  },
  {
    title: t("nav.admin.content_mgmt"),
    icon: Layers,
    items: [
      { title: t("nav.admin.brands"), url: "/admin/content/brands" },
      { title: t("nav.admin.banners"), url: "/admin/content/banners" },
      { title: t("nav.admin.blogs"), url: "/admin/content/blogs" },
      { title: t("nav.admin.stories"), url: "/admin/content/stories" },
      { title: t("nav.admin.gallery"), url: "/admin/content/gallery" },
      {
        title: t("nav.admin.notifications"),
        url: "/admin/content/notifications",
      },
    ],
  },
  {
    title: t("nav.admin.delivery_mgmt"),
    icon: Truck,
    items: [
      {
        title: t("nav.admin.deliveries_list"),
        url: "/admin/deliveryman/list",
      },
      {
        title: t("nav.admin.deliveries_map"),
        url: "/admin/logistics/map",
      },
      {
        title: t("nav.admin.deliveryman_reviews"),
        url: "/admin/deliveryman/reviews",
      },
      {
        title: t("nav.admin.deliveryman_requests"),
        url: "/admin/deliveryman/requests",
      },
      {
        title: t("nav.admin.deliveryman_settings"),
        url: "/admin/logistics/deliveryman-settings",
      },
      {
        title: t("nav.admin.vehicle_types"),
        url: "/admin/logistics/vehicles",
      },
      {
        title: t("nav.admin.delivery_zones"),
        url: "/admin/logistics/zones",
      },
    ],
  },
  {
    title: t("nav.admin.customer_mgmt"),
    icon: Users,
    items: [
      { title: t("nav.admin.users"), url: "/admin/users" },
      { title: t("nav.admin.roles"), url: "/admin/users/roles" },
      { title: t("nav.admin.wallets"), url: "/admin/customers/wallets" },
      {
        title: t("nav.admin.platform_wallet"),
        url: "/admin/business/wallet",
      },
      {
        title: t("nav.admin.subscribers"),
        url: "/admin/customers/subscribers",
      },
    ],
  },
  {
    title: t("nav.admin.marketing_ads"),
    icon: Megaphone,
    items: [
      { title: t("nav.admin.ads_list"), url: "/admin/marketing/ads" },
      {
        title: t("nav.admin.ads_packages"),
        url: "/admin/marketing/packages",
      },
      { title: t("nav.admin.bonuses"), url: "/admin/marketing/bonuses" },
      {
        title: t("nav.admin.referrals"),
        url: "/admin/marketing/referrals",
      },
      {
        title: t("nav.admin.email_subscribers"),
        url: "/admin/marketing/subscribers",
      },
      {
        title: t("nav.admin.cashback_rules"),
        url: "/admin/marketing/cashback",
      },
    ],
  },
  {
    title: t("nav.admin.transactions"),
    icon: DollarSign,
    items: [
      {
        title: t("nav.admin.all_transactions"),
        url: "/admin/finance/transactions",
      },
      {
        title: t("nav.admin.payout_requests"),
        url: "/admin/finance/payouts/requests",
      },
      {
        title: t("nav.admin.shop_subscriptions"),
        url: "/admin/finance/subscriptions",
      },
      {
        title: t("nav.admin.seller_payments"),
        url: "/admin/customers/payments/sellers",
      },
    ],
  },
  {
    title: t("nav.admin.reports_analytics"),
    icon: BarChart3,
    items: [
      {
        title: t("nav.admin.overview_report"),
        url: "/admin/reports/overview",
      },
      {
        title: t("nav.admin.products_report"),
        url: "/admin/reports/products",
      },
      {
        title: t("nav.admin.orders_report"),
        url: "/admin/reports/orders",
      },
      { title: t("nav.admin.stock_report"), url: "/admin/reports/stock" },
      {
        title: t("nav.admin.revenue_report"),
        url: "/admin/reports/revenue",
      },
    ],
  },
  {
    title: t("nav.admin.business_settings"),
    icon: Settings,
    items: [
      {
        title: t("nav.admin.general_settings"),
        url: "/admin/settings/general",
      },
      {
        title: t("nav.admin.permission_settings"),
        url: "/admin/settings/permissions",
      },
      {
        title: t("nav.admin.landing_page"),
        url: "/admin/settings/landing",
      },
      {
        title: t("nav.admin.currencies"),
        url: "/admin/settings/currencies",
      },
      {
        title: t("nav.admin.payment_methods"),
        url: "/admin/settings/payments",
      },
      {
        title: t("nav.admin.payment_payloads"),
        url: "/admin/business/payment-payloads",
      },
      {
        title: t("nav.admin.email_settings"),
        url: "/admin/settings/email",
      },
      {
        title: t("nav.admin.notification_settings"),
        url: "/admin/settings/notifications",
      },
      {
        title: t("nav.admin.social_settings"),
        url: "/admin/settings/social",
      },
      { title: t("nav.admin.app_settings"), url: "/admin/settings/app" },
      { title: t("nav.admin.page_setup"), url: "/admin/settings/pages" },
      { title: t("nav.admin.faqs"), url: "/admin/settings/faqs" },
      { title: t("nav.admin.terms"), url: "/admin/settings/terms" },
      { title: t("nav.admin.privacy"), url: "/admin/settings/privacy" },
      {
        title: t("nav.admin.flutter_app"),
        url: "/admin/settings/flutter",
      },
    ],
  },
  {
    title: t("nav.admin.system_settings"),
    icon: Database,
    items: [
      { title: t("nav.admin.languages"), url: "/admin/system/languages" },
      {
        title: t("nav.admin.translations"),
        url: "/admin/system/translations",
      },
      { title: t("nav.admin.backups"), url: "/admin/system/backup" },
      { title: t("nav.admin.system_update"), url: "/admin/system/update" },
      { title: t("nav.admin.system_info"), url: "/admin/system/info" },
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
