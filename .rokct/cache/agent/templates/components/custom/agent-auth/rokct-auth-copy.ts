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

// agent_sdk 1.26.0: the words beside the auth card (../site-shell.tsx).
// Every claim is the landing's own and is read from it (RK_HERO in
// landing/rokct-landing-content.ts): the headline, the lede and the three
// promises under the hero. The card's own words stay auth_sdk's.

import { PLATFORM_NAME } from "@/app/config/platform";
import { RK_HERO } from "@/components/custom/landing/rokct-landing-content";

export interface RokctAuthPanel {
  title: string[];
  lede: string;
}

const NAME = PLATFORM_NAME.toUpperCase();

export const ROKCT_AUTH_COPY = {
  sideLabel: `About ${NAME}`,
  login: {
    title: ["Welcome", "back."],
    lede: `Log in to your ${NAME} account to carry on.`,
  },
  register: {
    title: [RK_HERO.words[0], ...RK_HERO.tail],
    lede: RK_HERO.lede,
  },
  forgot: {
    title: ["Lost your", "password?"],
    lede: `Get back into your ${NAME} account.`,
  },
  points: RK_HERO.meta.map((m) => m.text),
};

/** The panel for the auth page at `pathname` (login when unknown). */
export function rokctAuthPanel(pathname: string | null): RokctAuthPanel {
  const p = pathname ?? "";
  const c = p.startsWith("/register") ? ROKCT_AUTH_COPY.register : p.startsWith("/forgot") ? ROKCT_AUTH_COPY.forgot : ROKCT_AUTH_COPY.login;
  return { title: [...c.title], lede: c.lede };
}
