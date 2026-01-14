"use server";

import { CompanyService } from "@/app/services/common/companies";

export async function getCompanies() {
    try {
        return await CompanyService.getList();
    } catch (e) { return []; }
}
