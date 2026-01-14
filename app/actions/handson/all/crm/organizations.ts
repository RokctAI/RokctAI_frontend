"use server";

import { verifyCrmRole } from "@/app/lib/roles";
import { OrganizationService } from "@/app/services/all/crm/organizations";

export async function getOrganizations(page = 1, limit = 20) {
    if (!await verifyCrmRole()) return { data: [], total: 0 };

    try {
        const result = await OrganizationService.getList(page, limit);
        return {
            data: result.data,
            total: result.total,
            page: result.page,
            limit: result.limit
        };
    } catch (e) {
        console.error("Failed to fetch Organizations", e);
        return { data: [], total: 0 };
    }
}

export async function getOrganization(id: string) {
    if (!await verifyCrmRole()) return { data: null, error: "Unauthorized" };

    try {
        const org = await OrganizationService.get(id);
        return { data: org };
    } catch (e) {
        console.error("Failed to fetch Organization", e);
        return { data: null, error: "Failed to fetch Organization" };
    }
}
