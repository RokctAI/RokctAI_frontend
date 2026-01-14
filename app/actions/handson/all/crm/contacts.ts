"use server";

import { verifyCrmRole } from "@/app/lib/roles";
import { ContactService } from "@/app/services/all/crm/contacts";

export interface Contact {
    name: string;
    full_name: string;
    image?: string;
    company_name?: string;
    email_id?: string;
    mobile_no?: string;
    status: string;
    designation?: string;
    department?: string;
    gender?: string;
    address_line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    modified: string;
    creation: string;
}

interface GetContactsResponse {
    data: Contact[];
    total: number;
    page: number;
    limit: number;
    error?: string;
}

export async function getContacts(page = 1, limit = 20): Promise<GetContactsResponse> {
    if (!await verifyCrmRole()) return { data: [], total: 0, page, limit, error: "Unauthorized" };

    try {
        const result = await ContactService.getList(page, limit);
        return {
            data: result.data as Contact[],
            total: result.total,
            page: result.page,
            limit: result.limit
        };
    } catch (e) {
        console.error("Failed to fetch Contacts", e);
        return { data: [], total: 0, page, limit, error: "Failed to fetch contact list" };
    }
}

export async function getContact(id: string) {
    if (!await verifyCrmRole()) return { data: null, error: "Unauthorized" };

    try {
        const doc = await ContactService.get(id);
        return { data: doc as Contact };
    } catch (e) {
        console.error("Failed to fetch Contact", e);
        // Distinguish not found vs other errors if possible, but generic error is safer for now
        return { data: null, error: "Contact not found or access denied" };
    }
}
