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

import { TermsService } from "@/app/services/control/terms";
import { revalidatePath } from "next/cache";

export async function getMasterTerms() {
  return TermsService.getMasterTerms();
}

export async function saveMasterTerm(
  name: string | undefined,
  title: string,
  terms: string,
) {
  await TermsService.saveMasterTerm(name, title, terms);
  revalidatePath("/handson/control/terms");
  return { success: true };
}

export async function deleteMasterTerm(name: string) {
  await TermsService.deleteMasterTerm(name);
  revalidatePath("/handson/control/terms");
  return { success: true };
}
