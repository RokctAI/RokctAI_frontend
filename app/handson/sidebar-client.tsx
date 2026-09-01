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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, Package } from "lucide-react";

interface MenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

// Entries below are appended by the Rokct SDK installer
// (sdk_installer_base.py update_integrations()). Each installed SDK's
// manifest declares a `{ href, label }` line that is inserted on a new
// line immediately after the marker comment. Do not remove or reformat
// the marker on the next line inside the array.
const sdkNavItems: { href: string; label: string }[] = [
  // @rokct-sdk-nav-start
  // @rokct-sdk-nav-end
];

export function HandsOnSidebarClient({
  items,
  mobile = false,
}: {
  items: MenuItem[];
  mobile?: boolean;
}) {
  const pathname = usePathname();

  // SDK-injected entries, skipping any route the host already renders.
  const injectedItems = sdkNavItems.filter(
    (sdkItem) => !items.some((item) => item.href === sdkItem.href),
  );

  const linkClassName = (href: string) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
      pathname === href || (href !== "/handson" && pathname.startsWith(href))
        ? "bg-muted text-primary"
        : "text-muted-foreground"
    } ${mobile ? "px-2.5 gap-4 text-foreground" : ""}`;

  return (
    <>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={linkClassName(item.href)}
        >
          <item.icon className={`h-4 w-4 ${mobile ? "h-5 w-5" : ""}`} />
          {item.title}
        </Link>
      ))}
      {injectedItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={linkClassName(item.href)}
        >
          <Package className={`h-4 w-4 ${mobile ? "h-5 w-5" : ""}`} />
          {item.label}
        </Link>
      ))}
    </>
  );
}
