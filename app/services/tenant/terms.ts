import { TenantBaseService } from "./base";

export interface TenantTerm {
    name: string;
    title: string;
    terms: string;
    disabled: number;
}

export class TermsService {
    static async getAvailableMasterTerms() {
        return TenantBaseService.getList("Terms and Conditions", {
            fields: ["name", "title", "terms"],
            filters: { disabled: 0 },
            limit: 100
        });
    }

    static async getTenantTerms() {
        return TenantBaseService.getList("Terms and Conditions", {
            fields: ["name", "title", "terms", "disabled", "modified"],
            order_by: "modified desc"
        });
    }

    static async getTerm(name: string) {
        return TenantBaseService.getDoc("Terms and Conditions", name);
    }

    static async createTerm(data: any) {
        return TenantBaseService.insert({ doctype: "Terms and Conditions", ...data });
    }

    static async updateTerm(name: string, data: any) {
        return TenantBaseService.update("Terms and Conditions", name, data);
    }

    static async deleteTerm(name: string) {
        return TenantBaseService.delete("Terms and Conditions", name);
    }
}
