// @ts-nocheck
/**
 * Generated Zod Validators for Platform Module: lending, Group: operations
 * Author: ROKCT Code Generator
 */
import * as z from "zod";

export const runInterestAccrualSchema = z.object({
  term_loan: z.string().optional().or(z.literal("")),
});

export type RunInterestAccrualValues = z.infer<typeof runInterestAccrualSchema>;

