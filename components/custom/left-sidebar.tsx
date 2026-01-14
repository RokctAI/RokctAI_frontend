"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Users, Package, Briefcase, MessageSquare, Plus, PanelLeft } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar";
import { BrandLogo } from "@/components/custom/brand-logo";

interface LeftSidebarProps extends React.ComponentProps<typeof Sidebar> {
    activeModule: string;
    onModuleSelect: (module: string) => void;
    onNewSession: () => void;
}

export function LeftSidebar({ activeModule, onModuleSelect, onNewSession, ...props }: LeftSidebarProps) {
    const { toggleSidebar } = useSidebar();
    const [isVisible, setIsVisible] = useState(false);
    const modules = [
        { id: "HR", icon: Users, label: "HR Management" },
        { id: "CRM", icon: Briefcase, label: "CRM & Sales" },
        { id: "SCM", icon: Package, label: "Supply Chain" },
    ];

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Sidebar
            collapsible="icon"
            {...props}
            style={{ "--sidebar-width-icon": "3.6rem", ...props.style } as React.CSSProperties}
            className={cn("!overflow-visible border-r border-border/30 bg-muted/10 backdrop-blur-sm transition-opacity duration-1000", isVisible ? "opacity-100" : "opacity-0", props.className)}
        >


            <SidebarContent>
                <SidebarMenu className="gap-2 group-data-[collapsible=icon]:gap-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:pt-4">
                    {modules.map((m) => (
                        <SidebarMenuItem key={m.id}>
                            <SidebarMenuButton
                                isActive={activeModule === m.id}
                                onClick={() => onModuleSelect(m.id)}
                                tooltip={m.label}
                                size="lg"
                                className="group-data-[collapsible=icon]:justify-center data-[active=true]:bg-transparent hover:bg-transparent h-auto py-1 overflow-visible"
                            >
                                <div className={cn(
                                    "flex shrink-0 items-center justify-center rounded-2xl transition-all duration-300 relative z-20",
                                    "w-12 h-12",
                                    activeModule === m.id
                                        ? "border-2 border-primary shadow-lg text-foreground bg-background"
                                        : "border-2 border-transparent text-muted-foreground group-hover:bg-muted/50"
                                )}>
                                    <m.icon className="size-5 group-data-[collapsible=icon]:!size-7 transition-all" />
                                </div>
                                <span className="ml-3 group-data-[collapsible=icon]:hidden font-medium truncate">
                                    {m.label}
                                </span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={onNewSession}
                            tooltip="New Session"
                            variant="outline"
                            className="bg-primary/10 text-primary hover:bg-primary/20 justify-center"
                        >
                            <MessageSquare />
                            <span className="group-data-[collapsible=icon]:hidden">New Session</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
