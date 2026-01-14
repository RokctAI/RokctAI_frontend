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

