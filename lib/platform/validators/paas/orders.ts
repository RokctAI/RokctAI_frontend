// @ts-nocheck
/**
 * Generated Zod Validators for Platform Module: paas, Group: orders
 * Author: ROKCT Code Generator
 */
import * as z from "zod";

export const listSchema = z.object({
  status: z.string().optional().or(z.literal("")),
  limit: z.coerce.number().optional(),
});

export type ListValues = z.infer<typeof listSchema>;

