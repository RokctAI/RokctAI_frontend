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
          // Keep this 0. Frappe's Note permission query is `owner = user OR
          // public = 1`, so a public Note is readable by every user on the
          // site. This is the user's own note, so it must stay private.
          public: 0,
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
