import { TenantBaseService } from "./base";

export class StorageService {
    static async getStorageUsage() {
        try {
            const client = await import("@/app/lib/client").then(m => m.getControlClient());
            const usage = await (client.db() as any).get_value("Storage Tracker", "Storage Tracker", "current_storage_usage_mb");
            return usage || 0;
        } catch (e) {
            return 0;
        }
    }
}
