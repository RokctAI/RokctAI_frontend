/*
 * Copyright (c) 2026 RokctAI
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
        url: "/paas/dashboard/products",
      },
      {
        title: t("nav.merchant.categories"),
        url: "/paas/dashboard/products/categories",
      },
      {
        title: t("nav.merchant.extras"),
        url: "/paas/dashboard/products/extras",
      },
      {
        title: t("nav.merchant.recipes"),
        url: "/paas/dashboard/products/receipts",
      },
      { title: t("nav.merchant.menus"), url: "/paas/dashboard/products/menus" },
      {
        title: t("nav.merchant.combos"),
        url: "/paas/dashboard/products/combos",
      },
    ],
  },
  {
    title: t("nav.merchant.orders"),
    icon: List,
    items: [
      { title: t("nav.merchant.all_orders"), url: "/paas/dashboard/orders" },
      {
        title: t("nav.merchant.parcel_orders"),
        url: "/paas/dashboard/orders/parcels",
      },
      {
        title: t("nav.merchant.refunds"),
        url: "/paas/dashboard/orders/refunds",
      },
      {
        title: t("nav.merchant.reviews"),
        url: "/paas/dashboard/orders/reviews",
      },
    ],
  },
  {
    title: t("nav.merchant.restaurant"),
    icon: Store,
    items: [
      {
        title: t("nav.merchant.branches"),
        url: "/paas/dashboard/restaurant/branches",
      },
      {
        title: t("nav.merchant.kitchens"),
        url: "/paas/dashboard/restaurant/kitchens",
      },
      {
        title: t("nav.merchant.staff"),
        url: "/paas/dashboard/restaurant/staff",
      },
    ],
  },
  {
    title: t("nav.merchant.booking"),
    icon: Calendar,
    items: [
      {
        title: t("nav.merchant.reservations"),
        url: "/paas/dashboard/booking/reservations",
      },
      {
        title: t("nav.merchant.tables_zones"),
        url: "/paas/dashboard/booking/tables",
      },
    ],
  },
  {
    title: t("nav.merchant.business"),
    icon: Briefcase,
    items: [
      {
        title: t("nav.merchant.subscriptions"),
        url: "/paas/dashboard/business/subscriptions",
      },
      {
        title: t("nav.merchant.ad_packages"),
        url: "/paas/dashboard/business/ads",
      },
      { title: t("nav.merchant.invites"), url: "/paas/dashboard/invites" },
    ],
  },
  {
    title: t("nav.merchant.finance"),
    icon: DollarSign,
    items: [
      {
        title: t("nav.merchant.wallet"),
        url: "/paas/dashboard/finance/wallet",
      },
      {
        title: t("nav.merchant.transactions"),
        url: "/paas/dashboard/finance/transactions",
      },
      {
        title: t("nav.merchant.payouts"),
        url: "/paas/dashboard/finance/payouts",
      },
    ],
  },
  {
    title: t("nav.merchant.marketing"),
    icon: Megaphone,
    items: [
      {
        title: t("nav.merchant.coupons"),
        url: "/paas/dashboard/marketing/coupons",
      },
      {
        title: t("nav.merchant.bonuses"),
        url: "/paas/dashboard/marketing/bonuses",
      },
    ],
  },
  {
    title: t("nav.merchant.content"),
    icon: Layers,
    items: [
      {
        title: t("nav.merchant.stories"),
        url: "/paas/dashboard/content/stories",
      },
      {
        title: t("nav.merchant.brands"),
        url: "/paas/dashboard/content/brands",
      },
      {
        title: t("nav.merchant.shop_gallery"),
        url: "/paas/dashboard/settings/gallery",
      },
      {
        title: t("nav.merchant.parcel_settings"),
        url: "/paas/dashboard/settings/parcel",
      },
    ],
  },
  {
    title: t("nav.merchant.customers"),
    icon: Users,
    url: "/paas/dashboard/customers",
  },
  {
    title: t("nav.merchant.reports"),
    icon: BarChart3,
    url: "/paas/dashboard/reports",
  },
  {
    title: t("nav.merchant.pos"),
    icon: Store, // Or another suitable icon
    url: "/paas/dashboard/pos",
  },
  {
    title: t("nav.merchant.settings"),
    icon: Settings,
    url: "/paas/dashboard/settings",
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
