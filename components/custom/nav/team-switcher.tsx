"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { PLATFORM_NAME } from "@/app/config/platform"

import { getGlobalSettings } from "@/app/actions/handson/control/system/global-settings"

export function TeamSwitcher() {
    const { isMobile } = useSidebar()
    const { data: session } = useSession()
    const [isBeta, setIsBeta] = React.useState(false)

    React.useEffect(() => {
        async function fetchSettings() {
            const settings = await getGlobalSettings()
            if (settings?.isBetaMode) {
                setIsBeta(true)
            }
        }
        fetchSettings()
    }, [])

    const rawName = (session?.user as any)?.siteName || PLATFORM_NAME
    // Parse name: juvo.tenant.rokct.ai -> JUVO
    const parsedName = rawName.split('.')[0].toUpperCase()

    const displayName = isBeta ? `${parsedName} Beta` : parsedName

    const activeTeam = {
        name: displayName,
        logo: "/images/logo.svg",
        plan: isBeta ? "Beta" : "Pro",
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <Image
                            src={activeTeam.logo}
                            height={24}
                            width={24}
                            alt="logo"
                        />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                            {activeTeam.name}
                        </span>
                        <span className="truncate text-xs">{activeTeam.plan}</span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
