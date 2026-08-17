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

import { UserService } from "@/app/services/all/lms/user";
import { getCurrentSession } from "@/app/(auth)/actions";
import { verifyLmsRole } from "@/app/lib/roles";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function fetchUserInfo() {
  if (!(await verifyLmsRole())) return null;
  return await UserService.getUserInfo();
}

export async function fetchStreakInfo() {
  if (!(await verifyLmsRole())) return null;
  return await UserService.getStreakInfo();
}

export async function fetchProfile() {
  if (!(await verifyLmsRole())) return null;
  return await UserService.getProfile();
}

export async function updateProfileAction(data: any) {
  if (!(await verifyLmsRole()))
    return { success: false, error: "Unauthorized" };

  try {
    const res = await UserService.updateProfile(data);
    revalidatePath("/handson/all/lms/profile");
    return res;
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function fetchCertificates() {
  if (!(await verifyLmsRole())) return [];
  return await UserService.getCertificates();
}
