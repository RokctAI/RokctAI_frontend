import { ControlBaseService } from "./base";

// Frappe whitelisted responses may arrive as the bare value or wrapped in { message }.
const unwrap = (res: any) => (res && typeof res === "object" && "message" in res ? res.message : res);

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
      await ControlBaseService.call("control.control.api.tenders.get_tender_detail", { slug }),
    );
  }

  static async claimTender(slug: string): Promise<TenderBid> {
    return unwrap(
      await ControlBaseService.call("control.control.api.tenders.claim_tender", { slug }),
    );
  }

  static async getMyBids(): Promise<TenderBid[]> {
    return unwrap(await ControlBaseService.call("control.control.api.tenders.get_my_bids", {}));
  }

  static async updateBidStatus(
    bid: string,
    status: string,
    extras: { submitted_on?: string; outcome_value?: number; outcome_notes?: string } = {},
  ): Promise<TenderBid> {
    return unwrap(
      await ControlBaseService.call("control.control.api.tenders.update_bid_status", {
        bid,
        status,
        ...extras,
      }),
    );
  }

  static async updateChecklistItem(bid: string, item: string, done: boolean) {
    return unwrap(
      await ControlBaseService.call("control.control.api.tenders.update_checklist_item", {
        bid,
        item,
        done: done ? 1 : 0,
      }),
    );
  }
}
