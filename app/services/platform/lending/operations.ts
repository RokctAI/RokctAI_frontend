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

// @ts-nocheck
/**
 * Generated Service for Platform Module: lending, Group: operations
 * Author: ROKCT Code Generator
 */
import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class OperationsService {
  /**
   * Run interest accrual for term loans
   */
  static async runInterestAccrual(payload?: any, options?: ServiceOptions) {
    const isControl = "lending:operations:run_interest_accrual".startsWith(
      "control:",
    );
    const gateway = isControl
      ? "rcore.platform.api.control"
      : "rcore.platform.api.tenant";
    return await BaseService.call(
      gateway,
      {
        cmd: "lending:operations:run_interest_accrual",
        payload,
      },
      options,
    );
  }
}
