import { ControlBaseService } from "./base";

export interface NotificationTemplate {
    name: string;
    subject: string;
    response: string;
    type?: string;
}

export class NotificationService {
    static async getMasterTemplates() {
        return ControlBaseService.getList("Email Template", {
            fields: ["name", "subject", "response", "type"],
            limit_page_length: 100
        });
    }

    static async saveMasterTemplate(name: string, subject: string, content: string) {
        return ControlBaseService.update("Email Template", name, {
            subject: subject,
            response: content
        });
    }

    static async createMasterTemplate(name: string, subject: string, content: string) {
        return ControlBaseService.insert({
            doctype: "Email Template",
            name: name,
            subject: subject,
            response: content,
            type: "User"
        });
    }
}
