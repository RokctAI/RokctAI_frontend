import { getControlClient } from "@/app/lib/client";

export interface ServiceOptions {
    headers?: Record<string, string>;
}

export class TenantBaseService {
    public static async call(method: string, args: any = {}, options: ServiceOptions = {}) {
        const client = await getControlClient();
        return (client as any).call({
            method,
            args,
            headers: options.headers
        });
    }

    public static async getList(doctype: string, args: any = {}, options: ServiceOptions = {}) {
        const client = await getControlClient();
        return (client as any).get_list(doctype, {
            ...args,
            headers: options.headers
        });
    }

    public static async getDoc(doctype: string, name: string, options: ServiceOptions = {}) {
        const client = await getControlClient();
        return (client as any).get_doc(doctype, name, {
            headers: options.headers
        });
    }

    public static async insert(doc: any, options: ServiceOptions = {}) {
        const client = await getControlClient();
        return (client as any).insert({
            doc,
            headers: options.headers
        });
    }

    public static async update(doctype: string, name: string, data: any, options: ServiceOptions = {}) {
        const client = await getControlClient();
        return (client as any).update_doc(doctype, name, data);
    }

    public static async delete(doctype: string, name: string, options: ServiceOptions = {}) {
        const client = await getControlClient();
        return (client as any).delete_doc(doctype, name);
    }
}
