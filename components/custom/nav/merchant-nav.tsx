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
    Map
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
        title: "Products",
        icon: ShoppingBag,
        items: [
            { title: "All Products", url: "/paas/dashboard/products" },
            { title: "Categories", url: "/paas/dashboard/products/categories" },
            { title: "Extras & Addons", url: "/paas/dashboard/products/extras" },
            { title: "Recipes", url: "/paas/dashboard/products/receipts" },
            { title: "Menus", url: "/paas/dashboard/products/menus" },
            { title: "Combos", url: "/paas/dashboard/products/combos" },
        ],
    },
    {
        title: "Orders",
        icon: List,
        items: [
            { title: "All Orders", url: "/paas/dashboard/orders" },
            { title: "Parcel Orders", url: "/paas/dashboard/orders/parcels" },
            { title: "Refunds", url: "/paas/dashboard/orders/refunds" },
            { title: "Reviews", url: "/paas/dashboard/orders/reviews" },
        ],
    },
    {
        title: "Restaurant",
        icon: Store,
        items: [
            { title: "Branches", url: "/paas/dashboard/restaurant/branches" },
            { title: "Kitchens", url: "/paas/dashboard/restaurant/kitchens" },
            { title: "Staff", url: "/paas/dashboard/restaurant/staff" },
        ],
    },
    {
        title: "Booking",
        icon: Calendar,
        items: [
            { title: "Reservations", url: "/paas/dashboard/booking/reservations" },
            { title: "Tables & Zones", url: "/paas/dashboard/booking/tables" },
        ],
    },
    {
        title: "Business",
        icon: Briefcase,
        items: [
            { title: "Subscriptions", url: "/paas/dashboard/business/subscriptions" },
            { title: "Ad Packages", url: "/paas/dashboard/business/ads" },
            { title: "Invites", url: "/paas/dashboard/invites" },
        ],
    },
    {
        title: "Finance",
        icon: DollarSign,
        items: [
            { title: "Wallet", url: "/paas/dashboard/finance/wallet" },
            { title: "Transactions", url: "/paas/dashboard/finance/transactions" },
            { title: "Payouts", url: "/paas/dashboard/finance/payouts" },
        ],
    },
    {
        title: "Marketing",
        icon: Megaphone,
        items: [
            { title: "Coupons", url: "/paas/dashboard/marketing/coupons" },
            { title: "Bonuses", url: "/paas/dashboard/marketing/bonuses" },
        ],
    },
    {
        title: "Content",
        icon: Layers,
        items: [
            { title: "Stories", url: "/paas/dashboard/content/stories" },
            { title: "Brands", url: "/paas/dashboard/content/brands" },
            { title: "Shop Gallery", url: "/paas/dashboard/settings/gallery" },
            { title: "Parcel Settings", url: "/paas/dashboard/settings/parcel" },
        ],
    },
    {
        title: "Customers",
        icon: Users,
        url: "/paas/dashboard/customers",
    },
    {
        title: "Reports",
        icon: BarChart3,
        url: "/paas/dashboard/reports",
    },
    {
        title: "POS",
        icon: Store, // Or another suitable icon
        url: "/paas/dashboard/pos",
    },
    {
        title: "Settings",
        icon: Settings,
        url: "/paas/dashboard/settings",
    },

];

export function MerchantNav() {
    const pathname = usePathname();

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Merchant Panel</SidebarGroupLabel>
            <SidebarMenu>
                {merchantMenuItems.map((item) => (
                    item.items ? (
                        <Collapsible key={item.title} asChild defaultOpen={item.items.some(sub => pathname.startsWith(sub.url))} className="group/collapsible">
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
                                                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
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
                            <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                                <Link href={item.url}>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
