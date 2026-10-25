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

import { paasCall, platformCall } from "@/app/services/base/platform-gateway";
import type { ProofLinks } from "@/app/actions/studio/proofs/types";

export class ProofService {
  static approvalLink(candidate: string) {
    return paasCall<{ token: string; name: string; expires_on: string }>(
      "api.design_approval.create_approval_link",
      { candidate },
    );
  }

  static create(approval: string) {
    return paasCall<ProofLinks>("api.print_shop.create_proof", { approval });
  }

  static send(approval: string, recipients: string, message?: string) {
    return paasCall<ProofLinks & { sent_to: string[] }>("api.print_shop.send_proof", {
      approval,
      recipients,
      message,
    });
  }

  // Public review page: guest cmds, no session credentials sent.
  static review(token: string) {
    return platformCall<any>("api.design_approval.get_review", { token }, { requireAuth: false });
  }

  static submitReview(token: string, decision: string, comment?: string) {
    return platformCall<{ status: string }>(
      "api.design_approval.submit_review",
      { token, decision, comment },
      { requireAuth: false, throwOnError: true },
    );
  }
}
