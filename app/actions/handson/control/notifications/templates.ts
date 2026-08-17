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
