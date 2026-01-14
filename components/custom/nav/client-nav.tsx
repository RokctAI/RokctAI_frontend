"use client";

import {
    LayoutDashboard,
    CreditCard,
    UserCircle,
    Server,
    Phone
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const clientMenuItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        url: "/portal",
    },
    {
        title: "RPanel (Hosting)",
        icon: Server,
        url: "/handson/control/rpanel",
        // Logic to show/hide based on exact role can be done inside or passed as prop. 
        // For now we show it, assuming portal users might want to buy hosting.
        // But the user requested GUARDRAILS. 
        // We will refine this list in usage.
    },
    // {
    //     title: "Telephony",
    //     icon: Phone,
    //     url: "/portal/telephony",
    // },
    {
        title: "Billing",
        icon: CreditCard,
        url: "/portal/billing",
    },
    {
        title: "Profile",
        icon: UserCircle,
        url: "/portal/profile",
    },
];

export function ClientNav({ roles = [], modules = [] }: { roles?: string[], modules?: string[] }) {
    const pathname = usePathname();

    // Guardrail: Only show RPanel if:
    // 1. User has 'Hosting Client' role OR
    // 2. User has 'Hosting' module enabled (Preferred per user request)
    const showRpanel = modules.includes("Hosting") || roles.includes("Hosting Client");

    // Guardrail: Only show Telephony if:
    // 1. User has 'Telephony' module
    // const showTelephony = modules.includes("Telephony");

    const filteredItems = clientMenuItems.filter(item => {
        if (item.title === "RPanel (Hosting)" && !showRpanel) return false;
        return true;
    });

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Client Portal</SidebarGroupLabel>
            <SidebarMenu>
                {filteredItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
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
