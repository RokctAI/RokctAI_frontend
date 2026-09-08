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

import { CommercialService } from "@/app/services/all/crm/commercial";
import { verifyCrmRole } from "@/app/lib/roles";
import { revalidatePath } from "next/cache";

export interface ContractData {
  party_type: "Customer" | "Supplier";
  party_name: string;
  contract_terms?: string;
  status: string;
  start_date: string;
  end_date: string;
}

export async function getContracts(page = 1, limit = 20) {
  if (!(await verifyCrmRole())) return { data: [], total: 0 };

  try {
    const result = await CommercialService.getContracts(page, limit);
    return {
      data: result.data,
      total: result.total || 0,
      page: page,
      limit: limit,
    };
  } catch (e) {
    console.error("Failed to fetch Contracts", e);
    return { data: [], total: 0 };
  }
}

export async function getContract(id: string) {
  if (!(await verifyCrmRole())) return { data: null, error: "Unauthorized" };
  try {
    const result = await CommercialService.getContract(id);
    return { data: result };
  } catch (e) {
    return { data: null, error: "Failed to fetch Contract" };
  }
}

export async function createContract(data: ContractData) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  try {
    const response = await CommercialService.createContract(data);
    revalidatePath("/handson/all/crm/contracts");
    return { success: true, message: response };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error creating contract" };
  }
}
