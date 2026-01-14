import { ControlBaseService } from "../../base";

export class DatabasesService {
    static async getClientDatabases(clientName?: string) {
        return ControlBaseService.call("rpanel.hosting.doctype.hosting_client.hosting_client.get_client_databases", {
            client_name: clientName
        });
    }

    static async updateDatabasePassword(websiteName: string, newPassword: string) {
        return ControlBaseService.update("Hosted Website", websiteName, { db_password: newPassword });
    }
}
