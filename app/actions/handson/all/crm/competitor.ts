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

import { getClient, getControlClient } from "@/app/lib/client";
import { revalidatePath } from "next/cache";
import { verifyCrmRole } from "@/app/lib/roles";

// --- Competitor ---

export async function getCompetitors() {
  if (!(await verifyCrmRole())) return [];
  const frappe = await getClient();
  return (frappe.db() as any).get_list("Competitor", {
    fields: [
      "name",
      "competitor_name",
      "industry",
      "website",
      "threat_level",
      "headquarters_location",
    ],
    order_by: "modified desc",
  });
}

export async function getCompetitor(name: string) {
  if (!(await verifyCrmRole())) return null;
  const frappe = await getClient();
  return (frappe.db() as any).get_doc("Competitor", name);
}

export async function createCompetitor(data: any) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  const frappe = await getClient();
  const doc = await (frappe.db() as any).create_doc("Competitor", data);
  revalidatePath("/handson/all/competitor");
  return doc;
}

export async function updateCompetitor(name: string, data: any) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  const frappe = await getClient();
  const doc = await (frappe.db() as any).update_doc("Competitor", name, data);
  revalidatePath("/handson/all/competitor");
  return doc;
}

export async function deleteCompetitor(name: string) {
  if (!(await verifyCrmRole())) return;
  const frappe = await getClient();
  await (frappe.db() as any).delete_doc("Competitor", name);
  revalidatePath("/handson/all/competitor");
}

// --- Competitor Product (Child Table) ---
export async function getCompetitorProducts(competitorName?: string) {
  if (!(await verifyCrmRole())) return [];
  const frappe = await getClient();
  return (frappe.db() as any).get_list("Competitor Product", {
    fields: [
      "name",
      "their_product_name",
      "parent",
      "price_point",
      "description",
      "pricing_model",
    ],
    filters: competitorName ? { parent: competitorName } : {},
    order_by: "modified desc",
  });
}

// --- Competitor Route ---

export async function getCompetitorRoutes() {
  if (!(await verifyCrmRole())) return [];
  const frappe = await getClient();
  return (frappe.db() as any).get_list("Competitor Route", {
    fields: ["name", "route_name", "route_type", "route_path"],
    order_by: "modified desc",
  });
}

export async function createCompetitorRoute(data: any) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  const frappe = await getClient();
  const doc = await (frappe.db() as any).create_doc("Competitor Route", data);
  revalidatePath("/handson/all/crm/logistics");
  revalidatePath("/handson/all/competitor"); // Update map view too
  return doc;
}

export async function deleteCompetitorRoute(name: string) {
  if (!(await verifyCrmRole())) return;
  const frappe = await getClient();
  await (frappe.db() as any).delete_doc("Competitor Route", name);
  revalidatePath("/handson/all/crm/logistics");
  revalidatePath("/handson/all/competitor");
}

// --- Competitor Zone ---

export async function getCompetitorZones() {
  if (!(await verifyCrmRole())) return [];
  const frappe = await getClient();
  return (frappe.db() as any).get_list("Competitor Zone", {
    fields: ["name", "zone_name", "zone_path"],
    order_by: "modified desc",
  });
}

export async function createCompetitorZone(data: any) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  const frappe = await getClient();
  const doc = await (frappe.db() as any).create_doc("Competitor Zone", data);
  revalidatePath("/handson/all/crm/logistics");
  revalidatePath("/handson/all/competitor");
  return doc;
}

export async function deleteCompetitorZone(name: string) {
  if (!(await verifyCrmRole())) return;
  const frappe = await getClient();
  await (frappe.db() as any).delete_doc("Competitor Zone", name);
  revalidatePath("/handson/all/crm/logistics");
  revalidatePath("/handson/all/competitor");
}

// --- Lookups (Industry, Organ of State) ---

export async function getIndustries() {
  if (!(await verifyCrmRole())) return [];
  const frappe = await getControlClient();
  return (frappe.db() as any).get_list("Industry", {
    fields: ["name", "industry_name"],
    order_by: "name asc",
  });
}

export async function createIndustry(data: any) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  const frappe = await getControlClient();
  const doc = await (frappe.db() as any).create_doc("Industry", data);
  revalidatePath("/handson/all/competitor");
  return doc;
}

export async function getOrgansOfState() {
  if (!(await verifyCrmRole())) return [];
  const frappe = await getControlClient();
  return (frappe.db() as any).get_list("Organ of State", {
    fields: ["name", "organ_name", "type"],
    order_by: "name asc",
  });
}

// --- Location Types ---
export async function getLocationTypes() {
  if (!(await verifyCrmRole())) return [];
  const frappe = await getControlClient();
  return (frappe.db() as any).get_list("Location Type", {
    fields: ["name", "location_type_name"],
    order_by: "name asc",
  });
}
