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

import { ProofService } from "@/app/services/all/studio/proofs";

export async function createApprovalLink(candidate: string) {
  return ProofService.approvalLink(candidate);
}

export async function createProof(approval: string) {
  return ProofService.create(approval);
}

export async function sendProof(approval: string, recipients: string, message?: string) {
  return ProofService.send(approval, recipients, message);
}

export async function getReview(token: string) {
  return ProofService.review(token);
}

export async function submitReview(token: string, decision: string, comment?: string) {
  return ProofService.submitReview(token, decision, comment);
}
