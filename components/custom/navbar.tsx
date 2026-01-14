import Image from "next/image";
import Link from "next/link";
import { HardDrive, User, Settings, LogOut } from "lucide-react";

import { auth, signOut } from "@/app/(auth)/auth";
import { getGuestBranding } from "@/app/config/platform";
import { PLATFORM_NAME } from "@/app/config/constants";

import { HandsOnButton } from "./hands_on_button";
import { History } from "./history";
import { RightPlaneTrigger } from "./right-plane-trigger";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Branding } from "./branding";
import { BrandLogo } from "./brand-logo";

export const Navbar = async () => {
  let session = await auth();
  let showRPanel = false;
  let canUseAI = true;

  if (session?.user) {
    // Logic for AI Usage Check (existing)
    if (session.user.apiKey && session.user.apiSecret && session.user.isPaaS) {
      try {
        const usageRes = await fetch(`${process.env.ROKCT_BASE_URL}/api/method/rokct.rokct.tenant.api.get_token_usage`, {
          headers: {
            "Authorization": `token ${session.user.apiKey}:${session.user.apiSecret}`
          }
        });
        if (usageRes.ok) {
          const usageData = await usageRes.json();
          const {
            daily_flash_remaining,
            is_flash_unlimited,
            seat_limit_exceeded
          } = usageData.message || {};

          if (seat_limit_exceeded) {
            canUseAI = false;
          } else if (!is_flash_unlimited && daily_flash_remaining <= 0) {
            canUseAI = false;
          }
        }
      } catch (e) {
        console.error("Failed to check quota in Navbar", e);
      }
    }

    // Logic for RPanel Access
    // Show if user is Administrator/System Manager OR has "Hosting" module in subscription
    const roles = session.user.roles || [];
    const modules = session.user.modules || [];

    if (roles.includes("Administrator") || roles.includes("System Manager")) {
      showRPanel = true;
    } else if (modules.includes("Hosting") || modules.includes("RPanel")) {
      showRPanel = true;
    }
  }

  return (
    <>
      <div className="bg-background absolute top-0 left-0 w-dvw py-2 px-6 justify-between flex flex-row items-center z-30">
        <div className="flex flex-row gap-3 items-center">
          {session?.user && <History user={session.user} />}
          <div className="flex flex-row gap-2 items-center">
            <Link href="/" className="flex flex-row gap-2 items-center">
              <BrandLogo width={24} height={24} />
              <Branding showBadge={true} />
            </Link>
          </div>
        </div>

        <div className="flex flex-row gap-3 items-center">
          {session ? (
            <div className="flex flex-row items-center gap-3">
              {/* 1. AI Mode Toggle */}
              <HandsOnButton canUseAI={canUseAI} />

              {/* 2. RPanel Link (Conditional) */}
              {showRPanel && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/handson/control/rpanel" className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    <span className="hidden md:inline">RPanel</span>
                  </Link>
                </Button>
              )}

              {/* 3. Theme Toggle */}
              <ThemeToggle />

              {/* 4. User Label (Static) */}

              {/* 4. User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
                      <AvatarFallback className="bg-muted text-muted-foreground border border-border">
                        {session.user?.name?.slice(0, 2).toUpperCase() || "CN"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/handson/settings/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/handson/settings/users">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form
                      action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/landing" });
                      }}
                      className="w-full"
                    >
                      <button type="submit" className="flex w-full items-center text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button className="py-1.5 px-2 h-fit font-normal text-white" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
          <RightPlaneTrigger />
        </div>
      </div>
    </>
  );
};

