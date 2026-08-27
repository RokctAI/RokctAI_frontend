/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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
import { VoucherService } from "@/app/services/control/vouchers";

export async function getVouchers() {
  try {
    const list = await VoucherService.getVouchers();
    return { status: "success", data: list };
  } catch (error: any) {
    return { status: "failed", error: error.message };
  }
}

export async function createVoucher(data: any) {
  try {
    const res = await VoucherService.createVoucher(data);
    revalidatePath("/handson/control/vouchers");
    return { status: "success", data: res };
  } catch (error: any) {
    return { status: "failed", error: error.message };
  }
}

export async function updateVoucher(name: string, data: any) {
  try {
    const res = await VoucherService.updateVoucher(name, data);
    revalidatePath("/handson/control/vouchers");
    return { status: "success", data: res };
  } catch (error: any) {
    return { status: "failed", error: error.message };
  }
}

export async function deleteVoucher(name: string) {
  try {
    await VoucherService.deleteVoucher(name);
    revalidatePath("/handson/control/vouchers");
    return { status: "success" };
  } catch (error: any) {
    return { status: "failed", error: error.message };
  }
}
