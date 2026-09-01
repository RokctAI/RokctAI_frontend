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

import { NotificationService } from "@/app/services/control/notification_templates";
import type { NotificationTemplate } from "@/app/services/control/notification_templates";

/**
 * Fetches all Email Templates from the Control Site.
 */
export async function getMasterTemplates() {
  try {
    const response = await NotificationService.getMasterTemplates();
    return response?.message || [];
  } catch (e) {
    console.error("Failed to fetch Master Templates", e);
    return [];
  }
}

/**
 * Updates a Master Email Template.
 */
export async function saveMasterTemplate(
  name: string,
  subject: string,
  content: string,
) {
  try {
    const response = await NotificationService.saveMasterTemplate(
      name,
      subject,
      content,
    );
    return response?.message;
  } catch (e) {
    console.error("Failed to save Master Template", e);
    throw e;
  }
}

/**
 * Creates a new Master Email Template if it doesn't exist.
 */
export async function createMasterTemplate(
  name: string,
  subject: string,
  content: string,
) {
  try {
    const response = await NotificationService.createMasterTemplate(
      name,
      subject,
      content,
    );
    return response?.message;
  } catch (e) {
    console.error("Failed to create Master Template", e);
    throw e;
  }
}
