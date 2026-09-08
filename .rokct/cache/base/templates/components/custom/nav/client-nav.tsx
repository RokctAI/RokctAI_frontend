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
  CreditCard,
  UserCircle,
  Server,
  Phone,
} from "lucide-react";
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

const clientMenuItems = [
  {
    title: t("nav.client.dashboard"),
    icon: LayoutDashboard,
    url: "/portal",
  },
  {
    title: t("nav.client.rpanel"),
    icon: Server,
    url: "/handson/control/rpanel",
  },
  {
    title: t("nav.client.billing"),
    icon: CreditCard,
    url: "/portal/billing",
  },
  {
    title: t("nav.client.profile"),
    icon: UserCircle,
    url: "/portal/profile",
  },
];

export function ClientNav({
  roles = [],
  modules = [],
}: {
  roles?: string[];
  modules?: string[];
}) {
  const pathname = usePathname();

  // Guardrail: Only show RPanel if:
  // 1. User has 'Hosting Client' role OR
  // 2. User has 'Hosting' module enabled (Preferred per user request)
  const showRpanel =
    modules.includes("Hosting") || roles.includes("Hosting Client");

  // Guardrail: Only show Telephony if:
  // 1. User has 'Telephony' module
  // const showTelephony = modules.includes("Telephony");

  const filteredItems = clientMenuItems.filter((item) => {
    if (item.title === t("nav.client.rpanel") && !showRpanel) return false;
    return true;
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("nav.client.panel_label")}</SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item) => (
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
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
