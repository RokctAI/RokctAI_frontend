/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
