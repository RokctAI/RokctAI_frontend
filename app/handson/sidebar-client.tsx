"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface MenuItem {
    title: string;
    href: string;
    icon: LucideIcon;
}

export function HandsOnSidebarClient({ items, mobile = false }: { items: MenuItem[], mobile?: boolean }) {
    const pathname = usePathname();

    return (
        <>
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname === item.href || (item.href !== "/handson" && pathname.startsWith(item.href))
                            ? "bg-muted text-primary"
                            : "text-muted-foreground"
                        } ${mobile ? "px-2.5 gap-4 text-foreground" : ""}`}
                >
                    <item.icon className={`h-4 w-4 ${mobile ? "h-5 w-5" : ""}`} />
                    {item.title}
                </Link>
            ))}
        </>
    );
}
