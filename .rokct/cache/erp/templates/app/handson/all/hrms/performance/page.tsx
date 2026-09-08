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

import {
  getAllGoals,
  getAllAppraisals,
} from "@/app/actions/handson/all/hrms/performance";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";
import ClientPerformancePage from "./client_page";

export default async function PerformancePage() {
  const goals = await getAllGoals();
  const appraisals = await getAllAppraisals();
  const employees = await getEmployees();

  return (
    <ClientPerformancePage
      initialGoals={goals}
      initialAppraisals={appraisals}
      employees={employees}
    />
  );
}
