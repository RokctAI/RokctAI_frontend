"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { AdminNav } from "@/components/custom/nav/admin-nav"
import { MerchantNav } from "@/components/custom/nav/merchant-nav"
import { DeliveryNav } from "@/components/custom/nav/delivery-nav"
import { NavUser } from "@/components/custom/nav/nav-user"
import { TeamSwitcher } from "@/components/custom/nav/team-switcher"
import { ClientNav } from "@/components/custom/nav/client-nav"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session } = useSession()
    const roles = (session?.user as any)?.roles || []
    const modules = (session?.user as any)?.modules || []

    // Helper to check for client roles
    // We also treat users with 'Hosting' or 'Telephony' modules as clients
    const isClient = roles.some((r: string) => ['Hosting Client', 'Telephony Customer'].includes(r)) || 
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

                {(roles.some((r: string) => ['seller', 'manager', 'admin', 'Seller', 'System Manager'].includes(r))) && (
                    <MerchantNav />
                )}

                {(roles.some((r: string) => ['deliveryman', 'Delivery Man'].includes(r)) && !roles.some((r: string) => ['seller', 'Seller'].includes(r))) && (
                    <DeliveryNav />
                )}

                {(roles.includes("Administrator") && !roles.includes("System Manager") && !roles.includes("admin")) && (
                    <AdminNav />
                )}
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={session?.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
