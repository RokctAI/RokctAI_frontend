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

import { verifyCrmRole } from "@/app/lib/roles";
import { OrganizationService } from "@/app/services/all/crm/organizations";

export async function getOrganizations(page = 1, limit = 20) {
  if (!(await verifyCrmRole())) return { data: [], total: 0 };

  try {
    const result = await OrganizationService.getList(page, limit);
    return {
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  } catch (e) {
    console.error("Failed to fetch Organizations", e);
    return { data: [], total: 0 };
  }
}

export async function getOrganization(id: string) {
  if (!(await verifyCrmRole())) return { data: null, error: "Unauthorized" };

  try {
    const org = await OrganizationService.get(id);
    return { data: org };
  } catch (e) {
    console.error("Failed to fetch Organization", e);
    return { data: null, error: "Failed to fetch Organization" };
  }
}
