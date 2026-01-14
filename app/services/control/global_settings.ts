import { db } from "@/db";
import { globalSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export class GlobalSettingsService {
    static async getGlobalSettings() {
        try {
            const settings = await db.select().from(globalSettings).limit(1);
            if (settings.length === 0) {
                const newSettings = await db.insert(globalSettings).values({
                    isBetaMode: true,
                    isDebugMode: false,
                }).returning();
                return newSettings[0];
            }
            return settings[0];
        } catch (error) {
            console.error("Failed to fetch global settings:", error);
            return { isBetaMode: true, isDebugMode: false };
        }
    }

    static async toggleBetaMode() {
        try {
            const settings = await this.getGlobalSettings();
            if (settings && 'id' in settings && settings.id) {
                await db.update(globalSettings)
                    .set({ isBetaMode: !settings.isBetaMode })
                    .where(eq(globalSettings.id, settings.id));

                return { success: true, isBetaMode: !settings.isBetaMode };
            }
            return { success: false };
        } catch (error) {
            console.error("Failed to toggle beta mode:", error);
            return { success: false };
        }
    }

    static async toggleDebugMode() {
        try {
            const settings = await this.getGlobalSettings();
            if (settings && 'id' in settings && settings.id) {
                await db.update(globalSettings)
                    .set({ isDebugMode: !settings.isDebugMode })
                    .where(eq(globalSettings.id, settings.id));

                return { success: true, isDebugMode: !settings.isDebugMode };
            }
            return { success: false };
        } catch (error) {
            console.error("Failed to toggle debug mode:", error);
            return { success: false };
        }
    }
}
