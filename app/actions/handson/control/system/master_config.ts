"use server";

import { MasterConfigService, ConfigCategory, ConfigRegion, ConfigItem } from "@/app/services/control/master_config";

export type { ConfigCategory, ConfigRegion, ConfigItem };

export async function getMasterConfigItems(regionFilter?: string, categoryFilter?: string) {
    try {
        const response = await MasterConfigService.getMasterConfigItems(regionFilter, categoryFilter);
        return response?.message || [];
    } catch (e) {
        console.error("Failed to fetch Config Items", e);
        return [];
    }
}

export async function saveConfigItem(item: ConfigItem) {
    try {
        const response = await MasterConfigService.saveConfigItem(item);
        return response?.message;
    } catch (e) {
        console.error("Failed to save Config Item", e);
        throw e;
    }
}

export async function deleteConfigItem(name: string) {
    try {
        await MasterConfigService.deleteConfigItem(name);
        return true;
    } catch (e) {
        console.error("Failed to delete Config Item", e);
        throw e;
    }
}
