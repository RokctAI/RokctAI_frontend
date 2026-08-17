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

import { BaseService } from "@/app/services/common/base";
import { Batch } from "@/app/actions/handson/all/lms/batches/types";

export class BatchService extends BaseService {
  /**
   * Get user's batches.
   */
  static async getMyBatches(): Promise<Batch[]> {
    try {
      return await this.call("lms.lms.api.get_my_batches");
    } catch (error) {
      console.error("BatchService.getMyBatches error:", error);
      return [];
    }
  }

  /**
   * Admin: Get created batches.
   */
  static async getCreatedBatches() {
    try {
      return await this.call("lms.lms.api.get_created_batches");
    } catch (error) {
      console.error("BatchService.getCreatedBatches error:", error);
      return [];
    }
  }
}
