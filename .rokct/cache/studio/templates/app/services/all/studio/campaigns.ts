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


// Studio gateway cmds, each whitelisted by studio's own frappe/manifest.json
// (cmd co-location rule, SDK_ECOSYSTEM.md).

import { paasCall } from "@/app/services/base/platform-gateway";
import type { CampaignStatus, NewCampaign } from "@/app/actions/studio/campaigns/types";

export class CampaignService {
  static list(page = 1) {
    return paasCall<any[]>("api.design_campaign.list_campaigns", { page });
  }

  static create(values: NewCampaign) {
    return paasCall<{ name: string }>("api.design_campaign.create_campaign", {
      ...values,
      formats: JSON.stringify(values.formats),
    });
  }

  static start(name: string) {
    return paasCall<{ name: string; status: string }>("api.design_campaign.start_campaign", { name });
  }

  static status(name: string) {
    return paasCall<CampaignStatus>("api.design_campaign.get_campaign_status", { name });
  }
}
