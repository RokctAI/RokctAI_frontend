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

import { auth, signOut } from "@/app/(auth)/auth";
import { PLATFORM_NAME, getGuestBranding } from "@/app/config/platform";
import {
  HR_ROLES,
  FINANCE_ROLES,
  SYSTEM_ROLES,
  EMPLOYEE_ROLES,
  HOSTING_ROLES,
  TELEPHONY_ROLES,
  LMS_ROLES,
} from "@/app/lib/role_constants";
import Link from "next/link";
import {
  LayoutDashboard,
  CreditCard,
  Phone,
  FileText,
  Wallet,
  Settings,
  Code,
  Menu,
  Users,
  Mail,
  Search,
  BrainCircuit,
  Printer,
  BarChart3,
  ScrollText,
  Workflow,
  Target,
  Megaphone,
  Lightbulb,
  Bell,
  Map,
  Calculator,
  Briefcase,
  LifeBuoy,
  UserCog,
  PieChart,
  CalendarCheck,
  Receipt,
  Plane,
  Banknote,
  UserCheck,
  HardDrive,
  Globe,
  Database,
  Folder,
  ShieldCheck,
  Clock,
  GraduationCap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { HandsOnSidebarClient } from "./sidebar-client";
import { AiStatusPill } from "@/components/custom/ai-status-pill";

// Define menu items
const controlItems = [
  // --- Overview ---
  {
    title: "Dashboard",
    href: "/handson/control",
    icon: LayoutDashboard,
    roles: SYSTEM_ROLES,
  }, // Restricted to System Roles (Admins)

  // --- Commercial ---
  {
    title: "Finance",
    href: "/handson/control/finance",
    icon: Wallet,
    roles: FINANCE_ROLES,
  },
  {
    title: "Subscriptions",
    href: "/handson/control/subscriptions",
    icon: CreditCard,
    roles: SYSTEM_ROLES,
  },
  // --- Hosting ---
  {
    title: "Hosting Dashboard",
    href: "/handson/control/rpanel",
    icon: HardDrive,
    roles: HOSTING_ROLES,
  },
  {
    title: "Websites",
    href: "/handson/control/rpanel/websites",
    icon: Globe,
    roles: HOSTING_ROLES,
  },
  {
    title: "Databases",
    href: "/handson/control/rpanel/databases",
    icon: Database,
    roles: HOSTING_ROLES,
  },
  {
    title: "Emails",
    href: "/handson/control/rpanel/emails",
    icon: Mail,
    roles: HOSTING_ROLES,
  },
  {
    title: "FTP",
    href: "/handson/control/rpanel/ftp",
    icon: Folder,
    roles: HOSTING_ROLES,
  },
  {
    title: "Backups",
    href: "/handson/control/rpanel/backups",
    icon: ShieldCheck,
    roles: HOSTING_ROLES,
  },
  {
    title: "Cron Jobs",
    href: "/handson/control/rpanel/cron",
    icon: Clock,
    roles: HOSTING_ROLES,
  },

  // --- Operations ---
  {
    title: "Telephony",
    href: "/handson/control/telephony",
    icon: Phone,
    roles: TELEPHONY_ROLES,
  },
  {
    title: "Tender & Tasks",
    href: "/handson/control/tender",
    icon: FileText,
    roles: SYSTEM_ROLES,
  },
  {
    title: "Global Workflows",
    href: "/handson/control/workflows",
    icon: Workflow,
    roles: SYSTEM_ROLES,
  },

  // --- Configuration ---
  {
    title: "System",
    href: "/handson/control/system",
    icon: Settings,
    roles: SYSTEM_ROLES,
  },
  {
    title: "Terms & Conditions",
    href: "/handson/control/terms",
    icon: ScrollText,
    roles: SYSTEM_ROLES,
  },
  {
    title: "Print Formats",
    href: "/handson/control/print-formats",
    icon: Printer,
    roles: SYSTEM_ROLES,
  },
  {
    title: "Notification Specs",
    href: "/handson/control/notifications",
    icon: Bell,
    roles: SYSTEM_ROLES,
  },

  // --- Communication ---
  {
    title: "Announcements",
    href: "/handson/control/announcements",
    icon: Megaphone,
    roles: SYSTEM_ROLES,
  },

  // --- Tools ---
  {
    title: "Report Builder",
    href: "/handson/control/reports",
    icon: BarChart3,
    roles: SYSTEM_ROLES,
  },
  {
    title: "Developer",
    href: "/handson/control/developer",
    icon: Code,
    roles: SYSTEM_ROLES,
  },
];

const tenantItems = [
  // --- Overview ---
  { title: "Dashboard", href: "/handson/tenant", icon: LayoutDashboard },

  // --- Communication ---
  {
    title: "Announcements",
    href: "/handson/tenant/announcements",
    icon: Lightbulb,
  },
  { title: "Support", href: "/handson/tenant/support", icon: LifeBuoy },

  // --- Settings ---
  {
    title: "Settings",
    href: "/handson/tenant/settings",
    icon: Settings,
    roles: SYSTEM_ROLES,
  },
];

// Items visible to everyone (Shared Modules)
const commonItems = [
  // --- Utilities ---
  { title: "Reports", href: "/handson/all/reports", icon: PieChart },
  { title: "Lookups", href: "/handson/all/lookups", icon: Search },

  // --- Global Settings ---
  {
    title: "Global Settings",
    href: "/handson/all/settings",
    icon: Settings,
    roles: SYSTEM_ROLES,
  },

  // --- Product ---
  { title: "Roadmap", href: "/handson/all/roadmap", icon: Map },
];

export default async function HandsOnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const branding = (await getGuestBranding()) as any;
  const userRoles = (session?.user as any)?.roles || [];
  const userRole = userRoles[0]; // Keep for legacy if needed, but logic should use array
  // This shell serves control-plane (rokctapp) users only — the paas product
  // has its own app shell repo (delivery-frontend), so there is no
  // paas-tenant branch here anymore.

  // Helper to check role access
  const hasRole = (itemRoles?: string[]) => {
    if (!itemRoles || itemRoles.length === 0) return true; // No roles defined = Everyone

    // If user is System Manager or Administrator, they usually see everything in Control side?
    // Actually, let's respect the explicit roles. But System Manager is usually in all those lists.
    // For "My" items (no roles), everyone sees them.

    if (!userRoles || userRoles.length === 0) return false;
    // Check if ANY of the user's roles match ANY of the item's allowed roles
    return itemRoles.some((role) => userRoles.includes(role));
  };

  // Control-plane users ignore module limits (they are the provider), so
  // access is filtered by role only.
  const filterItems = (items: any[]) => {
    return items.filter((item) => hasRole(item.roles));
  };

  let menuItems: any[] = [];
  let title = "Hands-on";

  const company = (session?.user as any)?.company;
  const companyLabel = company?.companyName || PLATFORM_NAME;

  // Apply Contextual Branding (Dashboard Titles)
  title = branding ? `${companyLabel} Control` : title;

  // Apply Role & Module Filtering
  menuItems = filterItems(menuItems);

  // If no items visible, show Access Denied
  if (menuItems.length === 0) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Access Restricted</h1>
          <p className="text-muted-foreground">
            You do not have the required permissions or subscription modules to
            access the system.
          </p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row pt-14">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 justify-between">
          <Link
            href="/handson"
            className="flex items-center gap-2 font-semibold italic"
          >
            <span className="">
              {branding ? (
                <span>
                  {branding.before}
                  <span style={branding.style}>{branding.code}</span>
                  {branding.after}
                  <span className="ml-2 opacity-60 font-normal">Control</span>
                </span>
              ) : (
                title
              )}
            </span>
          </Link>
          <div className="scale-75 origin-right">
            <AiStatusPill />
          </div>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <HandsOnSidebarClient items={menuItems} />
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 md:pl-0 w-full">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/handson"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <span className="sr-only">{title}</span>
                </Link>
                <HandsOnSidebarClient items={menuItems} mobile />
              </nav>
            </SheetContent>
          </Sheet>
          <span className="font-semibold flex-1">{title}</span>
          <div className="scale-75 origin-right">
            <AiStatusPill />
          </div>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:p-8">{children}</main>
      </div>
    </div>
  );
}
