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

import { getClient } from "@/app/lib/client";
import {
  recordTokenUsage,
  checkTokenQuota,
  ACTION_TOKEN_COST,
} from "@/app/lib/usage";
import { auth } from "@/app/(auth)/auth";
import { AI_MODELS } from "@/ai/models";
import { gatewayCall } from "@/app/lib/gateway-rpc";

export async function createAiTask(data: {
  name: string;
  priority?: string;
  end_date?: string;
  project?: string;
  assignee?: string;
  modelId?: string;
}) {
  const session = await auth();
  const client = await getClient();

  const modelToCharge = data.modelId || AI_MODELS.FREE.id;
  const hasQuota = await checkTokenQuota(session);
  if (!hasQuota) {
    return { success: false, error: "You have reached your limit for today." };
  }

  try {
    const response = await gatewayCall(client, "frappe.client.insert", {
        doc: {
          doctype: "Task",
          subject: data.name,
          priority: data.priority || "Medium",
          exp_end_date: data.end_date,
          project: data.project,
          _assign: data.assignee ? JSON.stringify([data.assignee]) : undefined, // Auto-assign if provided
          status: "Open",
        },
      });

    if (response?.message) {
      if (session) {
        recordTokenUsage(session, ACTION_TOKEN_COST, modelToCharge);
      }
      return { success: true, message: response.message };
    }
    return { success: false, error: "No response from backend" };
  } catch (e: any) {
    console.error("Failed to create AI Task", e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}

export async function createAiNote(data: {
  title: string;
  description?: string;
  modelId?: string;
}) {
  const session = await auth();
  const client = await getClient();

  const modelToCharge = data.modelId || AI_MODELS.FREE.id;
  const hasQuota = await checkTokenQuota(session);
  if (!hasQuota) {
    return { success: false, error: "You have reached your limit for today." };
  }

  try {
    const response = await gatewayCall(client, "frappe.client.insert", {
        doc: {
          doctype: "Note",
          title: data.title,
          public: 1,
        },
      });

    if (response?.message) {
      if (session) {
        recordTokenUsage(session, ACTION_TOKEN_COST, modelToCharge);
      }
      return { success: true, message: response.message };
    }
    return { success: false, error: "No response from backend" };
  } catch (e: any) {
    console.error("Failed to create AI Note", e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}

export async function createAiProject(data: {
  name: string;
  description?: string;
  modelId?: string;
}) {
  const session = await auth();
  const client = await getClient();

  const modelToCharge = data.modelId || AI_MODELS.FREE.id;
  const hasQuota = await checkTokenQuota(session);
  if (!hasQuota) {
    return { success: false, error: "You have reached your limit for today." };
  }

  try {
    const response = await gatewayCall(client, "frappe.client.insert", {
        doc: {
          doctype: "Project",
          project_name: data.name,
          notes: data.description,
          status: "Open",
        },
      });

    if (response?.message) {
      if (session) {
        recordTokenUsage(session, ACTION_TOKEN_COST, modelToCharge);
      }
      return { success: true, message: response.message };
    }
    return { success: false, error: "No response from backend" };
  } catch (e: any) {
    console.error("Failed to create AI Project", e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}
