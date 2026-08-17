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

import { BaseService, ServiceOptions } from "@/app/services/common/base";

export interface IntegrationApp {
  name: string; // e.g. "google_calendar", "slack"
  label: string;
  description: string;
  icon: string; // lucide icon name
  is_connected: boolean;
  settings?: any;
}

export const AVAILABLE_INTEGRATIONS: IntegrationApp[] = [
  {
    name: "google_calendar",
    label: "Google Calendar",
    description: "Sync events and meetings with your Google Calendar.",
    icon: "Calendar",
    is_connected: false,
  },
  {
    name: "slack",
    label: "Slack",
    description: "Receive system notifications and alerts in Slack channels.",
    icon: "Slack",
    is_connected: false,
  },
  {
    name: "zoom",
    label: "Zoom",
    description: "Automatically generate Zoom meeting links for events.",
    icon: "Video",
    is_connected: false,
  },
];

export class IntegrationService {
  static async getIntegrations(options?: ServiceOptions) {
    const services = JSON.parse(JSON.stringify(AVAILABLE_INTEGRATIONS)); // Deep copy

    try {
      const connectedApps = await BaseService.call(
        "frappe.client.get_list",
        {
          doctype: "Connected App",
          fields: ["name", "provider_name", "enabled"],
        },
        options,
      );

      if (connectedApps?.message) {
        connectedApps.message.forEach((app: any) => {
          const service = services.find(
            (s: IntegrationApp) =>
              s.name.toLowerCase() === app.provider_name.toLowerCase() ||
              s.label.toLowerCase() === app.provider_name.toLowerCase(),
          );
          if (service) {
            service.is_connected = !!app.enabled;
          }
        });
      }
    } catch (e) {
      console.error("Failed to fetch integrations status", e);
    }
    return services;
  }

  static async connectIntegration(
    serviceName: string,
    config: any,
    options?: ServiceOptions,
  ) {
    // Implementation would involve saving keys/tokens to the respective DocType
    // For now, logging as per original
    console.log(`Connecting ${serviceName} with config`, config);
    return { success: true, message: "Connected successfully" };
  }

  static async disconnectIntegration(
    serviceName: string,
    options?: ServiceOptions,
  ) {
    // Implementation would clear keys/tokens
    console.log(`Disconnecting ${serviceName}`);
    return { success: true, message: "Disconnected successfully" };
  }
}
