import { callPublicApi } from "../common/api";

export interface Opportunity {
  title: string;
  slug: string;
  institution?: string;
  organization?: string;
  closing_date?: string;
  deadline?: string;
  category?: string;
  tasks?: any[];
}

export class OpportunityPublicService {
  static async search(query: string) {
    const types = ["tenders", "grants", "equity"];

    const results = await Promise.all(
      types.map(type =>
        callPublicApi("rokct.platform.api.control", {
          cmd: "control:get_public_opportunities",
          payload: JSON.stringify({
            opportunity_type: type,
            filters: JSON.stringify({ title: ["like", `%${query}%`] })
          })
        })
      )
    );

    // rcore gateway wraps response in { status, data } — unwrap it
    return {
      tenders: ((results[0]?.data) ?? results[0] ?? []) as Opportunity[],
      grants:  ((results[1]?.data) ?? results[1] ?? []) as Opportunity[],
      equity:  ((results[2]?.data) ?? results[2] ?? []) as Opportunity[],
    };
  }
}
