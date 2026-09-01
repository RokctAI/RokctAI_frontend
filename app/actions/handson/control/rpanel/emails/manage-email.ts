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

import { revalidatePath } from "next/cache";
import { EmailsService } from "@/app/services/control/rpanel/emails/emails";

export async function getEmails(clientName?: string) {
  try {
    const res = await EmailsService.getClientEmails(clientName);
    return { message: res.message || res };
  } catch (e: any) {
    return { message: { success: false, error: e.message } };
  }
}

export async function createEmailAccount(
  website: string,
  emailUser: string,
  password: string,
) {
  try {
    const res = await EmailsService.createEmailAccount(
      website,
      emailUser,
      password,
    );

    if (res.exc) throw new Error(JSON.stringify(res.exc));

    revalidatePath("/rpanel/emails");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateEmailPassword(
  website: string,
  emailUser: string,
  newPassword: string,
) {
  try {
    const res = await EmailsService.updateEmailPassword(
      website,
      emailUser,
      newPassword,
    );

    if (res.exc) throw new Error(JSON.stringify(res.exc));

    revalidatePath("/rpanel/emails");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteEmailAccount(website: string, emailUser: string) {
  try {
    const res = await EmailsService.deleteEmailAccount(website, emailUser);

    if (res.exc) throw new Error(JSON.stringify(res.exc));

    revalidatePath("/rpanel/emails");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
