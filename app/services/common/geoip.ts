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

"use server";

import { headers } from "next/headers";
import { platformCall } from "@/app/services/base/platform-gateway";
import { GlobalSettingsService } from "../control/global_settings";

export type GeoIPData = {
  countryCode: string;
  countryName: string;
  currency?: string;
  ip?: string;
};

/**
 * Detects the country data from the request IP address.
 * Uses available headers (x-forwarded-for, etc.) or a fallback API if needed.
 * Returns ISO 2-letter country code and full country name.
 */
export async function getGuestCountryCode(): Promise<GeoIPData> {
  const headersList = await headers();

  // 1. Try Standard Edge Headers (Vercel, Cloudflare, etc.)
  const code =
    headersList.get("x-vercel-ip-country") || headersList.get("cf-ipcountry");

  // 2. Resolve Client IP
  const ip =
    headersList.get("cf-connecting-ip") ||
    headersList.get("x-real-ip") ||
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    "";

  // If we have an Edge Header for country, we can use it immediately for the code.
  // But we still want to look up the full country name for form pre-filling.
  if (!ip) {
    return {
      countryCode: code?.toUpperCase() || "",
      countryName: "",
      ip: "",
    };
  }

  // Check if debug mode is enabled
  const settings = await GlobalSettingsService.getGlobalSettings();
  const isDebug = settings?.isDebugMode ?? false;

  // Localhost / Internal IP Check
  if (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.")
  ) {
    // Remote Logging of Localhost — prefix-free telemetry manifest cmd
    // (`{app_name}.tenant.api.log_frontend_error`) via the gateway.
    if (isDebug) {
      platformCall(
        "tenant.api.log_frontend_error",
        {
          error_message: `GeoIP: Localhost detected (IP: ${ip})`,
          context: JSON.stringify({
            category: "GeoIP",
            ip: ip,
            level: "DEBUG",
          }),
        },
        { fetchOptions: { keepalive: true } },
      ).catch(() => {});
    }

    return {
      countryCode: code?.toUpperCase() || "",
      countryName: "",
    };
  }

  try {
    // Simple public IP lookup with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout

    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=countryCode,country,currency`,
      {
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.countryCode) {
        const result = {
          countryCode: data.countryCode.toUpperCase(),
          countryName: data.country || "",
          currency: data.currency || "",
          ip: ip,
        };

        // Remote Logging to Frappe for visibility — telemetry cmd via
        // the gateway.
        if (isDebug) {
          platformCall(
            "tenant.api.log_frontend_error",
            {
              error_message: `GeoIP Success: ${ip}`,
              context: JSON.stringify({
                category: "GeoIP",
                result: result,
                level: "DEBUG",
              }),
            },
            { fetchOptions: { keepalive: true } },
          ).catch(() => {});
        }

        return result;
      }
    }
  } catch (e) {
    // Remote Logging of failure — telemetry cmd via the gateway.
    if (isDebug) {
      platformCall(
        "tenant.api.log_frontend_error",
        {
          error_message: `GeoIP Failure: ${ip} - ${String(e)}`,
          context: JSON.stringify({
            category: "GeoIP",
            error: String(e),
            level: "ERROR",
          }),
        },
        { fetchOptions: { keepalive: true } },
      ).catch(() => {});
    }
  }

  // Fallback if IP lookup fails but we have a code header
  return {
    countryCode: code?.toUpperCase() || "",
    countryName: "",
    ip: ip,
  };
}
