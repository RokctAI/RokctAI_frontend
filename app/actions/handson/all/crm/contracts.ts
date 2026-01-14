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
    if (!await verifyCrmRole()) return { data: [], total: 0 };

    try {
        const result = await CommercialService.getContracts(page, limit);
        return {
            data: result.data,
            total: result.total || 0,
            page: page,
            limit: limit
        };
    } catch (e) {
        console.error("Failed to fetch Contracts", e);
        return { data: [], total: 0 };
    }
}

export async function getContract(id: string) {
    if (!await verifyCrmRole()) return { data: null, error: "Unauthorized" };
    try {
        const result = await CommercialService.getContract(id);
        return { data: result };
    } catch (e) {
        return { data: null, error: "Failed to fetch Contract" };
    }
}

export async function createContract(data: ContractData) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        const response = await CommercialService.createContract(data);
        revalidatePath("/handson/all/crm/contracts");
        return { success: true, message: response };
    } catch (e: any) {
        return { success: false, error: e?.message || "Error creating contract" };
    }
}
