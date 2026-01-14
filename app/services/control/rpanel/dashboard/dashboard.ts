import { ControlBaseService } from "../../base";

export class DashboardService {
    static async getServerInfo() {
        return ControlBaseService.call("rpanel.hosting.doctype.hosting_client.hosting_client.get_server_info");
    }
}
