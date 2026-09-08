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

export const IssueSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  status: z.string().default("Open"),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  description: z.string().optional(),
  customer: z.string().optional(),
  raised_by: z.string().email().optional(),
});

export type IssueData = z.infer<typeof IssueSchema>;

export const SLASchema = z.object({
  service_level: z.string().min(1, "Service Level Name is required"),
  enabled: z.number().int().min(0).max(1).default(1),
  default_priority: z
    .enum(["Low", "Medium", "High", "Urgent"])
    .default("Medium"),
});

export type SLAData = z.infer<typeof SLASchema>;
