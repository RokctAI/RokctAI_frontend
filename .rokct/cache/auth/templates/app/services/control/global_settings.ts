/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { db } from "@/db";
import { globalSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

// auth_sdk-installed GlobalSettings store: the drizzle/Postgres-backed
// implementation of the neutral seam the bare shell commits at this same
// path (same class name, same method contracts — the installer overwrites
// the seam at compose time). GlobalSettingsRecord mirrors the seam's
// exported type so shell callers (app/lib/client.ts's system client,
// branding, handson system settings) typecheck identically bare and
// composed; the drizzle row is structurally assignable to it.
export type GlobalSettingsRecord = {
  id?: string;
  isBetaMode: boolean;
  isDebugMode: boolean;
  adminApiKey?: string | null;
  adminApiSecret?: string | null;
  platformSyncSecret?: string | null;
};

export class GlobalSettingsService {
  static async getGlobalSettings(): Promise<GlobalSettingsRecord> {
    try {
      const settings = await db.select().from(globalSettings).limit(1);
      if (settings.length === 0) {
        const newSettings = await db
          .insert(globalSettings)
          .values({
            isBetaMode: true,
            isDebugMode: false,
          })
          .returning();
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
      if (settings && "id" in settings && settings.id) {
        await db
          .update(globalSettings)
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
      if (settings && "id" in settings && settings.id) {
        await db
          .update(globalSettings)
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
