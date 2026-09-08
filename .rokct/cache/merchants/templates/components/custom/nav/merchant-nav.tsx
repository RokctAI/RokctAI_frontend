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
  ShoppingBag,
  List,
  Store,
  Calendar,
  Briefcase,
  DollarSign,
  Megaphone,
  Layers,
  Users,
  BarChart3,
  Settings,
  ChevronRight,
  Map,
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

const merchantMenuItems = [
  {
    title: t("nav.merchant.products"),
    icon: ShoppingBag,
    items: [
      {
        title: t("nav.merchant.all_products"),
        url: "/manager/products",
      },
      {
        title: t("nav.merchant.categories"),
        url: "/manager/products/categories",
      },
      {
        title: t("nav.merchant.extras"),
        url: "/manager/products/extras",
      },
      {
        title: t("nav.merchant.recipes"),
        url: "/manager/products/receipts",
      },
      { title: t("nav.merchant.menus"), url: "/manager/products/menus" },
      {
        title: t("nav.merchant.combos"),
        url: "/manager/products/combos",
      },
    ],
  },
  {
    title: t("nav.merchant.orders"),
    icon: List,
    items: [
      { title: t("nav.merchant.all_orders"), url: "/manager/orders" },
      {
        title: t("nav.merchant.parcel_orders"),
        url: "/manager/orders/parcels",
      },
      {
        title: t("nav.merchant.refunds"),
        url: "/manager/orders/refunds",
      },
      {
        title: t("nav.merchant.reviews"),
        url: "/manager/orders/reviews",
      },
    ],
  },
  {
    title: t("nav.merchant.restaurant"),
    icon: Store,
    items: [
      {
        title: t("nav.merchant.branches"),
        url: "/manager/restaurant/branches",
      },
      {
        title: t("nav.merchant.kitchens"),
        url: "/manager/restaurant/kitchens",
      },
      {
        title: t("nav.merchant.staff"),
        url: "/manager/restaurant/staff",
      },
    ],
  },
  {
    title: t("nav.merchant.booking"),
    icon: Calendar,
    items: [
      {
        title: t("nav.merchant.reservations"),
        url: "/manager/booking/reservations",
      },
      {
        title: t("nav.merchant.tables_zones"),
        url: "/manager/booking/tables",
      },
    ],
  },
  {
    title: t("nav.merchant.business"),
    icon: Briefcase,
    items: [
      {
        title: t("nav.merchant.subscriptions"),
        url: "/manager/business/subscriptions",
      },
      {
        title: t("nav.merchant.ad_packages"),
        url: "/manager/business/ads",
      },
      { title: t("nav.merchant.invites"), url: "/manager/invites" },
    ],
  },
  {
    title: t("nav.merchant.finance"),
    icon: DollarSign,
    items: [
      {
        title: t("nav.merchant.wallet"),
        url: "/manager/finance/wallet",
      },
      {
        title: t("nav.merchant.transactions"),
        url: "/manager/finance/transactions",
      },
      {
        title: t("nav.merchant.payouts"),
        url: "/manager/finance/payouts",
      },
    ],
  },
  {
    title: t("nav.merchant.marketing"),
    icon: Megaphone,
    items: [
      {
        title: t("nav.merchant.coupons"),
        url: "/manager/marketing/coupons",
      },
      {
        title: t("nav.merchant.bonuses"),
        url: "/manager/marketing/bonuses",
      },
    ],
  },
  {
    title: t("nav.merchant.content"),
    icon: Layers,
    items: [
      {
        title: t("nav.merchant.stories"),
        url: "/manager/content/stories",
      },
      {
        title: t("nav.merchant.brands"),
        url: "/manager/content/brands",
      },
      {
        title: t("nav.merchant.shop_gallery"),
        url: "/manager/settings/gallery",
      },
      {
        title: t("nav.merchant.parcel_settings"),
        url: "/manager/settings/parcel",
      },
    ],
  },
  {
    title: t("nav.merchant.customers"),
    icon: Users,
    url: "/manager/customers",
  },
  {
    title: t("nav.merchant.reports"),
    icon: BarChart3,
    url: "/manager/reports",
  },
  {
    title: t("nav.merchant.pos"),
    icon: Store, // Or another suitable icon
    url: "/manager/pos",
  },
  {
    title: t("nav.merchant.settings"),
    icon: Settings,
    url: "/manager/settings",
  },
];

export function MerchantNav() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("nav.merchant.panel_label")}</SidebarGroupLabel>
      <SidebarMenu>
        {merchantMenuItems.map((item) =>
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
