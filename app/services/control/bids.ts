/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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

// [SDK-MANAGED] The canonical copy of this file lives in the tender module
// (corporate/tender/nextjs/templates/...). Edits here should be mirrored there.

import { ControlBaseService } from "./base";

// Gateway contract (control/hooks.py + app/services/base/platform-gateway.ts):
// the control gateway only serves cmds carrying the `control:` prefix, so
// every call below uses the registered `control:<name>` cmd — never the raw
// dotted `control.control.api.tenders.*` path (which the gateway rejects).

// Frappe whitelisted responses may arrive as the bare value or wrapped in { message }.
const unwrap = (res: any) =>
  res && typeof res === "object" && "message" in res ? res.message : res;

export interface ChecklistItem {
  name: string;
  task_text: string;
  weight: number;
  status: "Open" | "Done";
}

export interface TenderBid {
  name: string;
  tender_slug: string;
  tender_title?: string;
  institution?: string;
  closing_date?: string;
  status: string;
  enrichment_level?: string;
  submitted_on?: string;
  outcome_value?: number;
  checklist?: ChecklistItem[];
  tasks_total?: number;
  tasks_done?: number;
}

export interface TenderDetail {
  tender: Record<string, any>;
  tasks: { task_text: string; weight: number }[];
  enrichment_level: "ADVANCED" | "GENERIC";
  advanced_available: boolean;
  entitled: boolean;
  entitlement_reason: string;
  bid: { name: string; status: string } | null;
}

export class TenderBidService {
  static async getTenderDetail(slug: string): Promise<TenderDetail> {
    return unwrap(
      await ControlBaseService.call("control:get_tender_detail", { slug }),
    );
  }

  static async claimTender(slug: string): Promise<TenderBid> {
    return unwrap(
      await ControlBaseService.call("control:claim_tender", { slug }),
    );
  }

  static async getMyBids(): Promise<TenderBid[]> {
    return unwrap(await ControlBaseService.call("control:get_my_bids", {}));
  }

  static async updateBidStatus(
    bid: string,
    status: string,
    extras: {
      submitted_on?: string;
      outcome_value?: number;
      outcome_notes?: string;
    } = {},
  ): Promise<TenderBid> {
    return unwrap(
      await ControlBaseService.call("control:update_bid_status", {
        bid,
        status,
        ...extras,
      }),
    );
  }

  static async updateChecklistItem(bid: string, item: string, done: boolean) {
    return unwrap(
      await ControlBaseService.call("control:update_checklist_item", {
        bid,
        item,
        done: done ? 1 : 0,
      }),
    );
  }
}
