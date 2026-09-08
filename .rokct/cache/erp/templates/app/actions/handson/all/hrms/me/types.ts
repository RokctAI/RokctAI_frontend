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

export const EmployeeProfileSchema = z.object({
  first_name: z.string().min(1, "First Name is required"),
  last_name: z.string().optional(),
  contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
  id_number: z.string().optional(),
  tax_id: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account_no: z.string().optional(),
  bank_branch_code: z.string().optional(),
  company: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  status: z.string().optional(),
  date_of_joining: z.string().optional(),
});

export type EmployeeProfileData = z.infer<typeof EmployeeProfileSchema>;
