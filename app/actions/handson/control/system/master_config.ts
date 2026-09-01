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

"use server";

import {
  MasterConfigService,
  ConfigCategory,
  ConfigRegion,
  ConfigItem,
} from "@/app/services/control/master_config";

export type { ConfigCategory, ConfigRegion, ConfigItem };

export async function getMasterConfigItems(
  regionFilter?: string,
  categoryFilter?: string,
) {
  try {
    const response = await MasterConfigService.getMasterConfigItems(
      regionFilter,
      categoryFilter,
    );
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
