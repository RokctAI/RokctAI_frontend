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

import { serverSemanticSearch } from "./semantic-search";

export const ANCHORS = {
  task: "buy call email meeting schedule todo deadline",
  note: "remember idea thought journal log record",
  action_create: "create add new generate make build draft write",
  action_update: "update edit change modify amend fix correct",
  action_delete: "delete remove cancel trash destroy db_delete",
  action_find: "find search get show list view query where",
  entity_invoice: "invoice bill charge receipt payment purchase sales",
  entity_order: "order sales purchase co po",
  entity_quote: "quote proposal estimate offer bid quotation",
  entity_lead: "lead prospect customer client contact person sa_id kyc identification verification passport",
  entity_opportunity: "opportunity deal potential pipeline",
  entity_contract: "contract agreement sla",
  entity_project: "project plan campaign roadmap",
  entity_task: "task todo reminder deadline work job",
  entity_meeting: "meeting call appointment schedule calendar event",
  entity_email: "email message letter contact mail campaign",
  entity_employee: "employee staff worker hr personnel profile salary bank_details tax_id",
  entity_leave: "leave holiday vacation off sick timeoff",
  entity_claim: "expense claim reimbursement receipt money spend",
  entity_goal: "goal kpi target objective performance okr",
  entity_appraisal: "appraisal review evaluation feedback score",
  entity_item: "item product material stock inventory asset",
  entity_journal: "journal entry ledgers gl adjustment",
  entity_report: "report analytics dashboard stats metrics",
  entity_competitor: "competitor shop store rival business brand market",
};

export class IntentClassifierService {
  private async getBestMatch(scores: Record<string, number>, prefix: string) {
    let bestLabel = null;
    let bestScore = -1;

    for (const [key, score] of Object.entries(scores)) {
      if (key.startsWith(prefix)) {
        if (score > bestScore) {
          bestScore = score;
          bestLabel = key.replace(prefix, "");
        }
      }
    }
    return { label: bestLabel, score: bestScore };
  }

  async classify(text: string, contextEntity?: string) {
    const inputEmbedding = await serverSemanticSearch.getEmbedding(text);
    
    const scores: Record<string, number> = {};
    for (const [key, anchorText] of Object.entries(ANCHORS)) {
      const anchorEmbedding = await serverSemanticSearch.getEmbedding(anchorText);
      
      // Manual cosine similarity calculation
      let dot = 0, magA = 0, magB = 0;
      for (let i = 0; i < inputEmbedding.length; i++) {
        dot += inputEmbedding[i] * anchorEmbedding[i];
        magA += inputEmbedding[i] * inputEmbedding[i];
        magB += anchorEmbedding[i] * anchorEmbedding[i];
      }
      scores[key] = dot / (Math.sqrt(magA) * Math.sqrt(magB));
    }

    const actionResult = await this.getBestMatch(scores, "action_");
    let entityResult = await this.getBestMatch(scores, "entity_");

    if (contextEntity) {
      entityResult = { label: contextEntity, score: 1.0 };
    }

    const scoreTask = scores["task"];
    const scoreNote = scores["note"];
    const bestIntent = scoreTask > scoreNote ? "Task" : "Note";

    return {
      intent: bestIntent,
      details: {
        action: actionResult.label,
        actionScore: actionResult.score,
        entity: entityResult.label,
        entityScore: entityResult.score,
      },
      scores
    };
  }
}

export const intentClassifierService = new IntentClassifierService();
