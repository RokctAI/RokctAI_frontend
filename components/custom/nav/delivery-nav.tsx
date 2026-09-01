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

import { LayoutDashboard, Package, DollarSign, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import t from "@/app/lib/i18n";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const deliveryMenuItems = [
  {
    title: t("nav.delivery.dashboard"),
    url: "/paas/dashboard/delivery",
    icon: LayoutDashboard,
  },
  {
    title: t("nav.delivery.my_orders"),
    url: "/paas/dashboard/delivery/orders",
    icon: Package,
  },
  {
    title: t("nav.delivery.earnings"),
    url: "/paas/dashboard/delivery/finance",
    icon: DollarSign,
  },
  {
    title: t("nav.delivery.profile"),
    url: "/paas/dashboard/delivery/profile",
    icon: User,
  },
];

export function DeliveryNav() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("nav.delivery.panel_label")}</SidebarGroupLabel>
      <SidebarMenu>
        {deliveryMenuItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.url}
              tooltip={item.title}
            >
              <Link href={item.url}>
                {item.icon && <item.icon />}
                {item.title}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
