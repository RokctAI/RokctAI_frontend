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

import NextAuth, { DefaultSession, User } from "next-auth";
import { JWT } from "next-auth/jwt";

export interface CompanyContext {
  name: string;
  country: string;
  countryCode: string;
  currency?: string;
  license?: string;
  taxId?: string;
  companyName?: string;
  yearEndDate?: string;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      apiKey?: string;
      apiSecret?: string;
      roles?: string[];
      siteName?: string;
      isPaaS?: boolean;
      homePage?: string;
      plan?: string;
      status?: string;
      is_free_plan?: number;
      is_ai?: number;
      modules?: string[];
      allowed_models?: string[];
      isOnboarded?: boolean;
      location?: string | null;
      company?: CompanyContext;
    } & DefaultSession["user"];
  }

  interface User {
    apiKey?: string;
    apiSecret?: string;
    roles?: string[];
    siteName?: string;
    isPaaS?: boolean;
    homePage?: string;
    plan?: string;
    status?: string;
    is_free_plan?: number;
    is_ai?: number;
    modules?: string[];
    allowed_models?: string[];
    isOnboarded?: boolean;
    location?: string | null;
    company?: CompanyContext;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    apiKey?: string;
    apiSecret?: string;
    roles?: string[];
    siteName?: string;
    isPaaS?: boolean;
    homePage?: string;
    plan?: string;
    status?: string;
    is_free_plan?: number;
    is_ai?: number;
    modules?: string[];
    allowed_models?: string[];
    isOnboarded?: boolean;
    location?: string | null;
    company?: CompanyContext;
  }
}
