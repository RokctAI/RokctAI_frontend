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

import { z } from "zod";

export const LeadSchema = z.object({
  lead_name: z.string().min(1, "Name is required"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  organization: z.string().optional(),
  email_id: z.string().email("Invalid email").optional().or(z.literal("")),
  mobile_no: z.string().optional(),
  status: z.string().optional(),
  id_number: z.string().optional(),
  kyc_status: z.enum(["Pending", "Verified", "Rejected"]).optional(),
  industry: z.string().optional(),
  lead_owner: z.string().optional(),
});

export type LeadData = z.infer<typeof LeadSchema>;
