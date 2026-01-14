import { ControlBaseService } from "./base";
import { getControlClient } from "@/app/lib/client";

export interface MasterPrintFormat {
    name: string;
    doc_type: string;
    html: string;
    standard: boolean;
}

export class PrintFormatService {
    static async getMasterPrintFormats(doctype?: string) {
        const filters: any = {};
        if (doctype) {
            filters.doc_type = doctype;
        }

        return ControlBaseService.getList("Print Format", {
            fields: ["name", "doc_type", "html", "standard"],
            filters: filters,
            limit: 100
        });
    }

    static async saveMasterPrintFormat(name: string, doctype: string, html: string) {
        const client = await getControlClient();
        const exists = await (client.db() as any).get_value("Print Format", { name: name }, "name");

        if (exists && exists.message && exists.message.name) {
            return (client.db() as any).update_doc("Print Format", name, {
                html: html,
                doc_type: doctype,
                print_format_type: "Jinja"
            });
        } else {
            return (client.db() as any).create_doc("Print Format", {
                name: name,
                doc_type: doctype,
                html: html,
                print_format_type: "Jinja",
                standard: "No"
            });
        }
    }

    static async deleteMasterPrintFormat(name: string) {
        return ControlBaseService.delete("Print Format", name);
    }
}
