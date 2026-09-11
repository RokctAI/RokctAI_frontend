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


// The company pages this SDK renders (corporate_sdk 1.1.0; Ray,
// 2026-09-10: corporate_sdk owns /about and /team as renderers; their
// content comes from the shell's data/ folder - base_sdk 1.35.0's reader -
// or is empty). One record per page: the route and the word the frame's
// nav and the page's metadata show - the only words this SDK owns here,
// as base owns "Legal". No brand, no host.

/** The page slots corporate_sdk renders, as base's registry names them (PageSlot without "landing"). */
export type CompanyPage = "about" | "team";

export interface CompanyPageInfo {
  route: string;
  label: string;
}

export const COMPANY_PAGES: Readonly<Record<CompanyPage, CompanyPageInfo>> = {
  about: { route: "/about", label: "About" },
  team: { route: "/team", label: "Team" },
};

/** The one line a page draws when it has neither content from data/ nor a registered section. */
export const COMPANY_EMPTY_STATE: Readonly<Record<CompanyPage, string>> = {
  about: "There is nothing on this page yet.",
  team: "No team members have been listed yet.",
};
