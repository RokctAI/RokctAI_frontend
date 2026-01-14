import { ControlBaseService } from "../../base";

export class BackupsService {
    static async getBackups(website?: string) {
        return ControlBaseService.call('rpanel.hosting.doctype.site_backup.site_backup.get_backups', { website });
    }

    static async createBackup(website: string, backup_type: string = 'Full') {
        return ControlBaseService.call('rpanel.hosting.doctype.site_backup.site_backup.create_backup', { website, backup_type });
    }

    static async deleteBackup(backup_id: string) {
        return ControlBaseService.call('rpanel.hosting.doctype.site_backup.site_backup.delete_backup', { backup_id });
    }

    static async restoreBackup(backup_id: string) {
        return ControlBaseService.call('rpanel.hosting.doctype.site_backup.site_backup.restore_backup', { backup_id });
    }
}
