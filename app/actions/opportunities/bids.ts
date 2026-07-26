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
  extras: { submitted_on?: string; outcome_value?: number; outcome_notes?: string } = {},
) {
  try {
    const doc = await TenderBidService.updateBidStatus(bid, status, extras);
    revalidatePath("/opportunities/bids");
    return doc;
  } catch (e: any) {
    return { error: e?.message || "Unable to update bid" };
  }
}

export async function updateChecklistItem(bid: string, item: string, done: boolean) {
  try {
    return await TenderBidService.updateChecklistItem(bid, item, done);
  } catch (e: any) {
    return { error: e?.message || "Unable to update checklist item" };
  }
}
