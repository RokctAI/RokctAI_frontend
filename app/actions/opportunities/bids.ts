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

import { TenderBidService } from "@/app/services/control/bids";

// Server actions for the tender bid / checklist feature. All of these call the
// control plane with the logged-in user's token via getControlClient; failures
// (no session, no API keys, no entitlement) degrade to { error } so pages can
// fall back to the free teaser instead of crashing.

export async function getTenderDetail(slug: string) {
  try {
    return await TenderBidService.getTenderDetail(slug);
  } catch (e: any) {
    return { error: e?.message || "Unable to load tender detail" };
  }
}

export async function claimTender(slug: string) {
  try {
    const bid = await TenderBidService.claimTender(slug);
    revalidatePath("/opportunities/bids");
    return bid;
  } catch (e: any) {
    return { error: e?.message || "Unable to claim tender" };
  }
}

export async function getMyBids() {
  try {
    return await TenderBidService.getMyBids();
  } catch (e: any) {
    return { error: e?.message || "Unable to load bids" };
  }
}

export async function updateBidStatus(
  bid: string,
  status: string,
  extras: {
    submitted_on?: string;
    outcome_value?: number;
    outcome_notes?: string;
  } = {},
) {
  try {
    const doc = await TenderBidService.updateBidStatus(bid, status, extras);
    revalidatePath("/opportunities/bids");
    return doc;
  } catch (e: any) {
    return { error: e?.message || "Unable to update bid" };
  }
}

export async function updateChecklistItem(
  bid: string,
  item: string,
  done: boolean,
) {
  try {
    return await TenderBidService.updateChecklistItem(bid, item, done);
  } catch (e: any) {
    return { error: e?.message || "Unable to update checklist item" };
  }
}
