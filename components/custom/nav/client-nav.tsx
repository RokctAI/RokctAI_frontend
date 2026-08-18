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
