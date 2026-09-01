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
