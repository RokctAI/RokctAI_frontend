/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { db } from "@/db";
import { globalSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export class GlobalSettingsService {
  static async getGlobalSettings() {
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
