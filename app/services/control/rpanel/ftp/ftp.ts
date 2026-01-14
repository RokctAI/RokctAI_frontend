import { ControlBaseService } from "../../base";

export class FtpService {
    static async getClientFtpAccounts(clientName?: string) {
        return ControlBaseService.call("rpanel.hosting.doctype.hosting_client.hosting_client.get_client_ftp_accounts", {
            client_name: clientName
        });
    }

    static async createFtpAccount(website: string, username: string, password: string) {
        return ControlBaseService.call("rpanel.hosting.utils.ftp_manager.create_ftp_account", {
            website, username, password
        });
    }

    static async updateFtpPassword(name: string, newPassword: string) {
        return ControlBaseService.update("FTP Account", name, { password: newPassword });
    }

    static async deleteFtpAccount(name: string) {
        return ControlBaseService.delete("FTP Account", name);
    }
}
