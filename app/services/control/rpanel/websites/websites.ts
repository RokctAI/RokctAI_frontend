import { ControlBaseService } from "../../base";

export class WebsitesService {
    static async getClientWebsites(clientName?: string) {
        return ControlBaseService.call("rpanel.hosting.doctype.hosting_client.hosting_client.get_client_websites", {
            client_name: clientName
        });
    }

    static async deleteWebsite(name: string) {
        return ControlBaseService.delete("Hosted Website", name);
    }

    static async updateWebsite(name: string, data: any) {
        return ControlBaseService.update("Hosted Website", name, data);
    }

    static async createWebsite(data: any) {
        return ControlBaseService.insert({ doctype: "Hosted Website", ...data });
    }
}
