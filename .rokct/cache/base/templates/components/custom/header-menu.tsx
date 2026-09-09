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
//  - [HeaderMenuNav]  the inline desktop list: flat links, then the groups
//                     as ONE trigger (the first group's label) that opens a
//                     panel under the bar on hover, focus and click (Escape
//                     and an outside click close it) - the mega menu
//                     rokct.ai's own header drew before base shipped one.
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
import {
  ArrowUpRight,
  Box,
  ChevronDown,
  Chrome,
  FileText,
  Globe,
  MessageSquare,
  Smartphone,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type {
  HeaderMenuAction,
  HeaderMenuIcon,
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
  children,
}: {
  item: HeaderMenuItem;
  className?: string;
  onNavigate?: () => void;
  /** What to render inside; the label and its badge when absent. */
  children?: React.ReactNode;
}) {
  const body = children ?? (
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
 * The closed set of glyphs an item or action may name (HeaderMenuIcon).
 * Named imports, so the header bundles these eight and not the whole of
 * lucide-react; "chrome" is lucide's own mark, no third-party asset.
 */
const MENU_ICONS: Record<HeaderMenuIcon, LucideIcon> = {
  box: Box,
  globe: Globe,
  smartphone: Smartphone,
  "message-square": MessageSquare,
  zap: Zap,
  wrench: Wrench,
  "file-text": FileText,
  chrome: Chrome,
};

/** An item with a description or an icon is drawn as a card, not a link. */
const isCard = (item: HeaderMenuItem) => !!(item.description || item.icon);

const PANEL_LINK =
  "flex items-center gap-2 text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground";

/**
 * One card of the panel's lead column - rokct.ai's Browser Extension / Web
 * App / Mobile Apps tiles: an icon box, the label with its badge, one line
 * of blurb, and an arrow that shows on hover.
 */
function MenuCard({ item, onNavigate }: { item: HeaderMenuItem; onNavigate?: () => void }) {
  const Icon = item.icon ? MENU_ICONS[item.icon] : null;
  return (
    <MenuLink
      item={item}
      className="group flex items-center justify-between rounded-xl border border-border p-3 transition-colors hover:bg-foreground/5"
      onNavigate={onNavigate}
    >
      <span className="flex items-center gap-4">
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-foreground">
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
        )}
        <span className="flex flex-col">
          <span className="flex items-center gap-2 text-[14px] font-semibold leading-tight text-foreground">
            <span>{item.label}</span>
            {item.badge && <MenuLabel badge={item.badge} />}
          </span>
          {item.description && (
            <span className="mt-0.5 text-[12px] text-muted-foreground">
              {item.description}
            </span>
          )}
        </span>
      </span>
      <ArrowUpRight
        aria-hidden="true"
        className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
      />
    </MenuLink>
  );
}

/** A column's rows: cards for items that carry a blurb or icon, links otherwise. */
function PanelItems({
  items,
  onNavigate,
}: {
  items: HeaderMenuItem[];
  onNavigate?: () => void;
}) {
  return (
    <ul className={items.some(isCard) ? "flex flex-col gap-3" : "space-y-4"}>
      {items.map((item) => (
        <li key={item.key}>
          {isCard(item) ? (
            <MenuCard item={item} onNavigate={onNavigate} />
          ) : (
            <MenuLink item={item} className={PANEL_LINK} onNavigate={onNavigate} />
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * The groups on the desktop bar: ONE button - the first group's label - that
 * discloses a panel the width of the bar, anchored under it. Inside, the
 * first group's items form the lead column (300px, no repeated heading) and
 * every other group a headed column in a grid beside it: the layout of
 * rokct.ai's hand-written mega menu, in the shell's theme tokens.
 *
 * Opens on hover, on focus and on click; closes on Escape (focus returns to
 * the button), on a click outside, when focus leaves it, and on a click on
 * any of its links. The panel is `absolute` against the bar, whose
 * backdrop-filter makes it the containing block (see header.tsx), so it
 * spans the bar's full width and needs no knowledge of its height.
 */
function DesktopMegaMenu({ groups }: { groups: HeaderMenuResolvedGroup[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const [lead, ...columns] = groups;

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

  const close = useCallback(() => setOpen(false), []);

  return (
    <div
      ref={rootRef}
      className="flex h-full items-center"
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
        <span>{lead.label}</span>
        {lead.badge && <MenuLabel badge={lead.badge} />}
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
        className="absolute inset-x-0 top-full z-50 border-b border-border bg-background shadow-2xl"
      >
        <div className="mx-auto flex max-w-6xl gap-12 px-4 py-8">
          <div className="w-[300px] shrink-0">
            <PanelItems items={lead.items} onNavigate={close} />
          </div>
          {columns.length > 0 && (
            <div className="grid flex-1 grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-8">
              {columns.map((group) => (
                <section key={group.id} aria-label={group.label}>
                  <h4 className="mb-6 flex items-center gap-2 text-[15px] font-semibold text-foreground">
                    <span>{group.label}</span>
                    {group.badge && <MenuLabel badge={group.badge} />}
                  </h4>
                  <PanelItems items={group.items} onNavigate={close} />
                </section>
              ))}
            </div>
          )}
        </div>
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
 * The inline list for the desktop bar: the groups' one trigger first (the
 * old rokct.ai bar led with Product), then the flat links. Renders nothing when there is nothing to list, so the
 * header can mount it without deciding anything.
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
      {groups.length > 0 && <DesktopMegaMenu groups={groups} />}
      {items.map((item) => (
        <MenuLink key={item.key} item={item} className={INLINE_LINK} />
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
          "inline-flex items-center justify-center gap-2 font-medium transition-colors",
          layout === "bar"
            ? "rounded-md px-3 py-1.5 text-[13px]"
            : "w-full rounded-2xl py-4 text-lg font-bold",
          primary
            ? "bg-primary text-black hover:opacity-90"
            : "border border-border text-foreground hover:bg-foreground/5",
        );
        // 1.20.0: the glyph before the label (rokct.ai's Chrome mark on its
        // extension button), the size the panel's cards draw theirs at; no
        // icon named renders the label alone, as before.
        const Icon = action.icon ? MENU_ICONS[action.icon] : null;
        const content = (
          <>
            {Icon && <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />}
            <span>{action.label}</span>
          </>
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
            {content}
          </a>
        ) : (
          <Link
            key={action.id}
            href={action.href}
            className={className}
            onClick={onNavigate}
          >
            {content}
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
