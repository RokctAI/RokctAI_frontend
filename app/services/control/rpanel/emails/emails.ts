import { ControlBaseService } from "../../base";

export class EmailsService {
    static async getClientEmails(clientName?: string) {
        return ControlBaseService.call("rpanel.hosting.doctype.hosting_client.hosting_client.get_client_emails", {
            client_name: clientName
        });
    }

    static async createEmailAccount(website: string, emailUser: string, password: string) {
        return ControlBaseService.call("rpanel.hosting.doctype.hosted_website.hosted_website.add_email_account", {
            website, email_user: emailUser, password
        });
    }

    static async updateEmailPassword(website: string, emailUser: string, newPassword: string) {
        return ControlBaseService.call("rpanel.hosting.doctype.hosted_website.hosted_website.change_email_password", {
            website, email_user: emailUser, new_password: newPassword
        });
    }

    static async deleteEmailAccount(website: string, emailUser: string) {
        return ControlBaseService.call("rpanel.hosting.doctype.hosted_website.hosted_website.delete_email_account", {
            website, email_user: emailUser
        });
    }
}
