/*
 * Copyright (c) 2026 RokctAI
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
