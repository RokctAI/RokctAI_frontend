import { getClient } from "@/app/lib/client";

export interface ServiceOptions {
    headers?: Record<string, string>;
}

export class BaseService {
    /**
     * Helper to get the Frappe client and execute a call with optional headers.
     */
    public static async call(method: string, args: any = {}, options: ServiceOptions = {}) {
        const client = await getClient();
        return (client as any).call({
            method,
            args,
            headers: options.headers
        });
    }

    public static async getList(doctype: string, args: any = {}, options: ServiceOptions = {}) {
        const client = await getClient();
        return (client as any).get_list(doctype, {
            ...args,
            headers: options.headers
        });
    }

    public static async getDoc(doctype: string, name: string, options: ServiceOptions = {}) {
        const client = await getClient();
        return (client as any).get_doc(doctype, name, {
            headers: options.headers
        });
    }

    public static async insert(doc: any, options: ServiceOptions = {}) {
        const client = await getClient();
        return (client as any).insert({
            doc,
            headers: options.headers
        });
    }

    public static async setValue(doctype: string, name: string, fieldname: any, options: ServiceOptions = {}) {
        const client = await getClient();
        return (client as any).call({
            method: 'frappe.client.set_value',
            args: {
                doctype,
                name,
                fieldname
            },
            headers: options.headers
        });
    }

    public static async delete(doctype: string, name: string, options: ServiceOptions = {}) {
        const client = await getClient();
        return (client as any).delete(doctype, name, {
            headers: options.headers
        });
    }

    public static async submit(doc: any, options: ServiceOptions = {}) {
        const client = await getClient();
        return (client as any).submit({
            doc,
            headers: options.headers
        });
    }

    public static async cancel(doctype: string, name: string, options: ServiceOptions = {}) {
        const client = await getClient();
        return (client as any).cancel(doctype, name, {
            headers: options.headers
        });
    }
}
