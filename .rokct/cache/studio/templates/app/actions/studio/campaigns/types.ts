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


import type { Candidate } from "../requests/types";

export type NewCampaign = {
  formats: string[];
  title?: string;
  brief?: string;
  design_system?: string;
  master_request?: string;
};

export type CampaignStatus = {
  status: string;
  error_message: string | null;
  master_request: string | null;
  formats: {
    format: string;
    action: string;
    request_status: string | null;
    candidate: Omit<Candidate, "slot" | "attempt"> | null;
  }[];
};
