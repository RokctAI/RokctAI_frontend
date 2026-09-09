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

// The landing header's menu partials: the section links, dropdown groups
// and action buttons a home SDK asked for, in the two shapes the header
// (components/custom/header.tsx) renders them in.
//
//  - [HeaderMenuNav]  the inline desktop list: flat links, then each group
//                     as a label that opens a dropdown on hover, focus and
//                     click (Escape and an outside click close it).
//  - [HeaderMenuList] the stacked mobile list the burger panel shows: every
//                     link one under the other, each group as a headed
//                     list.
//  - [HeaderMenuActions] the call-to-action buttons, in either shape.
//
// Generic chrome, not product content - the same split
// components/custom/footer-chrome.tsx makes. No product name and no copy of
// its own: every word arrives resolved (see ./landing/header-menu.ts), the
// colours are the shell's theme tokens (foreground, border, background) so
// the menu takes each shell's palette, and the only painted element is the
// shared [MenuLabel] pill.
//
// [HeaderMenuRow], the 1.13.0 bar that sat UNDER the host's header, is kept
// as a thin wrapper around HeaderMenuNav so an import of it still compiles;
// the landing host no longer renders it (the menu is inside the header).

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import type {
  HeaderMenuAction,
  HeaderMenuItem,
  HeaderMenuResolvedGroup,
} from "@/components/custom/landing/header-menu";
import { MenuLabel } from "@/components/custom/menu-label";
import { cn } from "@/lib/utils";

/**
 * One entry, internal or external, with its label and optional badge.
 *
 * A "soon" entry is not out yet, so it is not a link: it renders as a
 * span with `aria-disabled` and the not-allowed cursor, label and badge
 * intact, the same way rokct.ai's own header treats a coming-soon feature.
 */
function MenuLink({
  item,
  className,
  onNavigate,
}: {
  item: HeaderMenuItem;
  className?: string;
  onNavigate?: () => void;
}) {
  const body = (
    <>
      <span>{item.label}</span>
      {item.badge && <MenuLabel badge={item.badge} />}
    </>
  );
  if (item.badge === "soon") {
    return (
      <span
        aria-disabled="true"
        className={cn(className, "cursor-not-allowed opacity-60 hover:opacity-60")}
      >
        {body}
      </span>
    );
  }
  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onNavigate}
      >
        {body}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className} onClick={onNavigate}>
      {body}
    </Link>
  );
}

const INLINE_LINK =
  "flex items-center gap-1.5 whitespace-nowrap text-foreground/70 transition-colors hover:text-foreground";

/**
 * A group on the desktop bar: a button that discloses its links. Opens on
 * hover, on focus and on click; closes on Escape (focus returns to the
 * button), on a click outside, and when focus leaves it.
 */
function DesktopGroup({ group }: { group: HeaderMenuResolvedGroup }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
    }
  }, []);

  const onBlur = useCallback((event: React.FocusEvent) => {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
      setOpen(false);
    }
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        className={cn(INLINE_LINK, "gap-1")}
      >
        <span>{group.label}</span>
        {group.badge && <MenuLabel badge={group.badge} />}
        <ChevronDown
          aria-hidden="true"
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
        />
      </button>
      {/* Kept in the DOM while closed so aria-controls always resolves;
          hidden with the attribute the shells' reset understands. */}
      <div
        id={panelId}
        hidden={!open}
        className="absolute left-0 top-full z-50 pt-2"
      >
        <ul className="min-w-[12rem] rounded-xl border border-border bg-background p-2 shadow-lg">
          {group.items.map((item) => (
            <li key={item.key}>
              <MenuLink
                item={item}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                onNavigate={() => setOpen(false)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export interface HeaderMenuNavProps {
  /** Already resolved against the page's live nav by [resolveHeaderMenu]. */
  items: HeaderMenuItem[];
  groups?: HeaderMenuResolvedGroup[];
  /** Extra classes on the nav element (the header passes its breakpoint). */
  className?: string;
  /** Accessible name for the nav; the page has other navs on it. */
  ariaLabel?: string;
}

/**
 * The inline list for the desktop bar. Renders nothing when there is
 * nothing to list, so the header can mount it without deciding anything.
 */
export function HeaderMenuNav({
  items,
  groups = [],
  className,
  ariaLabel = "Sections",
}: HeaderMenuNavProps) {
  if (items.length === 0 && groups.length === 0) return null;

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("items-center gap-5 text-sm", className)}
    >
      {items.map((item) => (
        <MenuLink key={item.key} item={item} className={INLINE_LINK} />
      ))}
      {groups.map((group) => (
        <DesktopGroup key={group.id} group={group} />
      ))}
    </nav>
  );
}

export interface HeaderMenuListProps {
  items: HeaderMenuItem[];
  groups?: HeaderMenuResolvedGroup[];
  className?: string;
  ariaLabel?: string;
  /** Called when a link is tapped, so the panel around the list can close. */
  onNavigate?: () => void;
}

const STACKED_LINK =
  "flex items-center justify-between gap-3 border-b border-border py-3 text-lg font-semibold text-foreground";

/**
 * The stacked list for the mobile panel: every link on its own row, each
 * group as a heading over its rows. Renders nothing for an empty menu.
 */
export function HeaderMenuList({
  items,
  groups = [],
  className,
  ariaLabel = "Menu",
  onNavigate,
}: HeaderMenuListProps) {
  if (items.length === 0 && groups.length === 0) return null;

  return (
    <nav aria-label={ariaLabel} className={className}>
      <ul>
        {items.map((item) => (
          <li key={item.key}>
            <MenuLink item={item} className={STACKED_LINK} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
      {groups.map((group) => (
        <section key={group.id} className="mt-4" aria-label={group.label}>
          <p className="flex items-center gap-2 pb-1 text-xs font-bold uppercase tracking-wider text-foreground/60">
            <span>{group.label}</span>
            {group.badge && <MenuLabel badge={group.badge} />}
          </p>
          <ul>
            {group.items.map((item) => (
              <li key={item.key}>
                <MenuLink
                  item={item}
                  className={cn(STACKED_LINK, "pl-3")}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}

export interface HeaderMenuActionsProps {
  actions: HeaderMenuAction[];
  /** `bar` is the desktop button; `stacked` the full-width mobile one. */
  layout?: "bar" | "stacked";
  onNavigate?: () => void;
}

/** The call-to-action buttons. Renders nothing for an empty list. */
export function HeaderMenuActions({
  actions,
  layout = "bar",
  onNavigate,
}: HeaderMenuActionsProps) {
  if (actions.length === 0) return null;

  return (
    <>
      {actions.map((action) => {
        const primary = (action.variant ?? "primary") === "primary";
        const className = cn(
          "inline-flex items-center justify-center font-medium transition-colors",
          layout === "bar"
            ? "rounded-md px-3 py-1.5 text-[13px]"
            : "w-full rounded-2xl py-4 text-lg font-bold",
          primary
            ? "bg-primary text-black hover:opacity-90"
            : "border border-border text-foreground hover:bg-foreground/5",
        );
        return action.external ? (
          <a
            key={action.id}
            href={action.href}
            target="_blank"
            rel="noreferrer"
            className={className}
            onClick={onNavigate}
          >
            {action.label}
          </a>
        ) : (
          <Link
            key={action.id}
            href={action.href}
            className={className}
            onClick={onNavigate}
          >
            {action.label}
          </Link>
        );
      })}
    </>
  );
}

export interface HeaderMenuRowProps {
  items: HeaderMenuItem[];
  groups?: HeaderMenuResolvedGroup[];
  className?: string;
  ariaLabel?: string;
}

/**
 * The 1.13.0 row: [HeaderMenuNav] in a full-width bar that scrolls sideways.
 * Kept so an existing import still compiles; the landing host stopped
 * rendering it in 1.14.0, when the menu moved inside the header.
 */
export function HeaderMenuRow({
  items,
  groups = [],
  className = "",
  ariaLabel = "Sections",
}: HeaderMenuRowProps) {
  if (items.length === 0 && groups.length === 0) return null;

  return (
    <div
      className={cn(
        "w-full border-b border-border bg-background/80 backdrop-blur",
        className,
      )}
    >
      <HeaderMenuNav
        items={items}
        groups={groups}
        ariaLabel={ariaLabel}
        className="mx-auto flex max-w-6xl overflow-x-auto px-4 py-2.5"
      />
    </div>
  );
}

export default HeaderMenuRow;
