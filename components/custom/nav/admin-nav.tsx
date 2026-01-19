"use client";


import {
    LayoutDashboard,
    ShoppingBag,
    Store,
    Users,
    Truck,
    FileText,
    Settings,
    BarChart3,
    CreditCard,
    Globe,
    Database,
    Info,
    Layers,
    Image as ImageIcon,
    MessageSquare,
    Bell,
    Share2,
    Smartphone,
    File,
    Languages,
    RotateCcw,
    List,
    Tags,
    Star,
    Utensils,
    Box,
    Map as MapIcon,
    Wallet,
    Mail,
    DollarSign,
    Calendar,
    Flag,
    Percent,
    Gift
    , ChevronRight, Megaphone
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


const menuItems = [
    {
        title: "Dashboard",
        url: "/paas/admin",
        icon: LayoutDashboard,
    },

    {
        title: "Product Management",
        icon: ShoppingBag,
        items: [
            { title: "Products", url: "/paas/admin/products" },
            { title: "Categories", url: "/paas/admin/products/categories" },
            { title: "Extras & Addons", url: "/paas/admin/products/extras" },
            { title: "Recipes", url: "/paas/admin/products/receipts" },
            { title: "Product Reviews", url: "/paas/admin/products/reviews" },
        ],
    },
    {
        title: "Order Management",
        icon: List,
        items: [
            { title: "All Orders", url: "/paas/admin/orders" },
            { title: "Parcel Orders", url: "/paas/admin/orders/parcel" },
            { title: "Scheduled Orders", url: "/paas/admin/orders/scheduled" },
            { title: "Order Reviews", url: "/paas/admin/orders/reviews" },
            { title: "Order Statuses", url: "/paas/admin/orders/settings" },
        ],
    },
    {
        title: "Shop Management",
        icon: Store,
        items: [
            { title: "Shops", url: "/paas/admin/shops" },
            { title: "Shop Categories", url: "/paas/admin/shops/categories" },
            { title: "Shop Units", url: "/paas/admin/shops/units" },
            { title: "Shop Reviews", url: "/paas/admin/shops/reviews" },
            { title: "Shop Tags", url: "/paas/admin/shops/tags" },
        ],
    },
    {
        title: "Content Management",
        icon: Layers,
        items: [
            { title: "Brands", url: "/paas/admin/content/brands" },
            { title: "Banners", url: "/paas/admin/content/banners" },
            { title: "Blogs", url: "/paas/admin/content/blogs" },
            { title: "Stories", url: "/paas/admin/content/stories" },
            { title: "Gallery", url: "/paas/admin/content/gallery" },
            { title: "Notifications", url: "/paas/admin/content/notifications" },
        ],
    },
    {
        title: "Delivery Management",
        icon: Truck,
        items: [
            { title: "Deliveries List", url: "/paas/admin/deliveryman/list" },
            { title: "Deliveries Map", url: "/paas/admin/logistics/map" },
            { title: "Deliveryman Reviews", url: "/paas/admin/deliveryman/reviews" },
            { title: "Deliveryman Requests", url: "/paas/admin/deliveryman/requests" },
            { title: "Deliveryman Settings", url: "/paas/admin/logistics/deliveryman-settings" },
            { title: "Vehicle Types", url: "/paas/admin/logistics/vehicles" },
            { title: "Delivery Zones", url: "/paas/admin/logistics/zones" },
        ],
    },
    {
        title: "Customer Management",
        icon: Users,
        items: [
            { title: "Users", url: "/paas/admin/users" },
            { title: "Roles", url: "/paas/admin/users/roles" },
            { title: "Wallets", url: "/paas/admin/customers/wallets" },
            { title: "Platform Wallet", url: "/paas/admin/business/wallet" },
            { title: "Subscribers", url: "/paas/admin/customers/subscribers" },
        ],
    },
    {
        title: "Marketing & Ads",
        icon: Megaphone,
        items: [
            { title: "Ads List", url: "/paas/admin/marketing/ads" },
            { title: "Ads Packages", url: "/paas/admin/marketing/packages" },
            { title: "Bonuses", url: "/paas/admin/marketing/bonuses" },
            { title: "Referrals", url: "/paas/admin/marketing/referrals" },
            { title: "Email Subscribers", url: "/paas/admin/marketing/subscribers" },
            { title: "Cashback Rules", url: "/paas/admin/marketing/cashback" },
        ],
    },
    {
        title: "Transactions",
        icon: DollarSign,
        items: [
            { title: "All Transactions", url: "/paas/admin/finance/transactions" },
            { title: "Payout Requests", url: "/paas/admin/finance/payouts/requests" },
            { title: "Shop Subscriptions", url: "/paas/admin/finance/subscriptions" },
            { title: "Seller Payments", url: "/paas/admin/customers/payments/sellers" },
        ],
    },
    {
        title: "Reports & Analytics",
        icon: BarChart3,
        items: [
            { title: "Overview Report", url: "/paas/admin/reports/overview" },
            { title: "Products Report", url: "/paas/admin/reports/products" },
            { title: "Orders Report", url: "/paas/admin/reports/orders" },
            { title: "Stock Report", url: "/paas/admin/reports/stock" },
            { title: "Revenue Report", url: "/paas/admin/reports/revenue" },
        ],
    },
    {
        title: "Business Settings",
        icon: Settings,
        items: [
            { title: "General Settings", url: "/paas/admin/settings/general" },
            { title: "Permission Settings", url: "/paas/admin/settings/permissions" },
            { title: "Landing Page", url: "/paas/admin/settings/landing" },
            { title: "Currencies", url: "/paas/admin/settings/currencies" },
            { title: "Payment Methods", url: "/paas/admin/settings/payments" },
            { title: "Payment Payloads", url: "/paas/admin/business/payment-payloads" },
            { title: "Email Settings", url: "/paas/admin/settings/email" },
            { title: "Notification Settings", url: "/paas/admin/settings/notifications" },
            { title: "Social Settings", url: "/paas/admin/settings/social" },
            { title: "App Settings", url: "/paas/admin/settings/app" },
            { title: "Page Setup", url: "/paas/admin/settings/pages" },
            { title: "FAQs", url: "/paas/admin/settings/faqs" },
            { title: "Terms & Conditions", url: "/paas/admin/settings/terms" },
            { title: "Privacy Policy", url: "/paas/admin/settings/privacy" },
            { title: "Flutter App", url: "/paas/admin/settings/flutter" },
        ],
    },
    {
        title: "System Settings",
        icon: Database,
        items: [
            { title: "Languages", url: "/paas/admin/system/languages" },
            { title: "Translations", url: "/paas/admin/system/translations" },
            { title: "Backups", url: "/paas/admin/system/backup" },
            { title: "System Update", url: "/paas/admin/system/update" },
            { title: "System Info", url: "/paas/admin/system/info" },
        ],
    },
];



export function AdminNav() {
    const pathname = usePathname();

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
            <SidebarMenu>
                {menuItems.map((item) => (
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
