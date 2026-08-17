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

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AdminNav } from "@/components/custom/nav/admin-nav";
import { MerchantNav } from "@/components/custom/nav/merchant-nav";
import { DeliveryNav } from "@/components/custom/nav/delivery-nav";
import { NavUser } from "@/components/custom/nav/nav-user";
import { TeamSwitcher } from "@/components/custom/nav/team-switcher";
import { ClientNav } from "@/components/custom/nav/client-nav";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const roles = (session?.user as any)?.roles || [];
  const modules = (session?.user as any)?.modules || [];

  // Helper to check for client roles
  // We also treat users with 'Hosting' or 'Telephony' modules as clients
  const isClient =
    roles.some((r: string) =>
      ["Hosting Client", "Telephony Customer"].includes(r),
    ) ||
    modules.includes("Hosting") ||
    modules.includes("Telephony");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {/* Role-Based Navigation Logic */}
        {isClient && <ClientNav roles={roles} modules={modules} />}

        {roles.some((r: string) =>
          ["seller", "manager", "admin", "Seller", "System Manager"].includes(
            r,
          ),
        ) && <MerchantNav />}

        {roles.some((r: string) =>
          ["deliveryman", "Delivery Man"].includes(r),
        ) &&
          !roles.some((r: string) => ["seller", "Seller"].includes(r)) && (
            <DeliveryNav />
          )}

        {roles.includes("Administrator") &&
          !roles.includes("System Manager") &&
          !roles.includes("admin") && <AdminNav />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
