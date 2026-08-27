/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
