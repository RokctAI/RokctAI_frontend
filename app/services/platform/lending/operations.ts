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
    const isControl = "lending:operations:run_interest_accrual".startsWith("control:");
    const gateway = isControl ? "rcore.platform.api.control" : "rcore.platform.api.tenant";
    return await BaseService.call(
      gateway,
      {
        cmd: "lending:operations:run_interest_accrual",
        payload
      },
      options
    );
  }
}
