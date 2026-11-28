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
// The hub theme's wrapper: every hub screen renders inside <HubTheme> so it
// takes the Sticks faces and the tokens in ./hub-theme.css (the one place
// the hub theme lives). Callers: components/custom/auth/agent-verify-pin-step.tsx
// (agent_sdk) and app/admin/hub/feature-switches/page.tsx (subscriptions_sdk).

import type { ReactNode } from "react";
import { Montserrat, Nunito } from "next/font/google";

import "./hub-theme.css";

const display = Montserrat({ subsets: ["latin"], variable: "--font-stx-display", display: "swap" });
const body = Nunito({ subsets: ["latin"], variable: "--font-stx-body", display: "swap" });

export function HubTheme({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`hub ${display.variable} ${body.variable} ${className}`}>{children}</div>;
}

export default HubTheme;
