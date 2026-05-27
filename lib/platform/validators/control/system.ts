// @ts-nocheck
/**
 * Generated Zod Validators for Platform Module: control, Group: system
 * Author: ROKCT Code Generator
 */
import * as z from "zod";

export const rebootSchema = z.object({
  force: z.boolean().optional(),
});

export type RebootValues = z.infer<typeof rebootSchema>;

