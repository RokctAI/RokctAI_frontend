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

import { revalidatePath } from "next/cache";

import { CampaignService } from "@/app/services/all/studio/campaigns";

import type { NewCampaign } from "./types";

export async function listCampaigns(page = 1) {
  try {
    return await CampaignService.list(page);
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return [];
  }
}

export async function createCampaign(values: NewCampaign) {
  const out = await CampaignService.create(values);
  revalidatePath("/studio/campaigns");
  return out;
}

export async function startCampaign(name: string) {
  const out = await CampaignService.start(name);
  revalidatePath(`/studio/campaigns/${name}`);
  return out;
}

export async function getCampaignStatus(name: string) {
  return CampaignService.status(name);
}
