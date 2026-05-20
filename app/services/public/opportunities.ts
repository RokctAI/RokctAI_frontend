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

    // We call the public API for each type
    const results = await Promise.all(
      types.map(type =>
        callPublicApi("control.control.api.get_public_opportunities", {
          opportunity_type: type,
          filters: JSON.stringify({ title: ["like", `%${query}%`] })
        })
      )
    );

    return {
      tenders: (results[0] || []) as Opportunity[],
      grants: (results[1] || []) as Opportunity[],
      equity: (results[2] || []) as Opportunity[]
    };
  }
}
