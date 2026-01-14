"use client";

import {
    LayoutDashboard,
    Package,
    DollarSign,
    User
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

const deliveryMenuItems = [
    {
        title: "Dashboard",
        url: "/paas/dashboard/delivery",
        icon: LayoutDashboard,
    },
    {
        title: "My Orders",
        url: "/paas/dashboard/delivery/orders",
        icon: Package,
    },
    {
        title: "Earnings",
        url: "/paas/dashboard/delivery/finance",
        icon: DollarSign,
    },
    {
        title: "Profile",
        url: "/paas/dashboard/delivery/profile",
        icon: User,
    },
];

export function DeliveryNav() {
    const pathname = usePathname();

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Delivery Panel</SidebarGroupLabel>
            <SidebarMenu>
                {deliveryMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
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
