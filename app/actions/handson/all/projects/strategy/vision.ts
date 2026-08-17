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

import { StrategyService } from "@/app/services/all/projects/strategy";
import { revalidatePath } from "next/cache";

export async function getVisions() {
  try {
    const res = await StrategyService.getVisions();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function getVision(name: string) {
  try {
    const res = await StrategyService.getVision(name);
    return res.data;
  } catch (e) {
    return null;
  }
}

export async function createVision(data: any) {
  try {
    const res = await StrategyService.createVision(data);
    revalidatePath("/handson/all/projects/strategy");
    return res;
  } catch (e) {
    return null;
  }
}

export async function updateVision(name: string, data: any) {
  try {
    const res = await StrategyService.updateVision(name, data);
    revalidatePath("/handson/all/projects/strategy");
    return res;
  } catch (e) {
    return null;
  }
}

export async function deleteVision(name: string) {
  try {
    await StrategyService.deleteVision(name);
    revalidatePath("/handson/all/projects/strategy");
  } catch (e) {}
}
