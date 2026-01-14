import { z } from "zod";

export const IssueSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    status: z.string().default("Open"),
    priority: z.enum(["Low", "Medium", "High", "Urgent"]),
    description: z.string().optional(),
    customer: z.string().optional(),
    raised_by: z.string().email().optional(),
});

export type IssueData = z.infer<typeof IssueSchema>;

export const SLASchema = z.object({
    service_level: z.string().min(1, "Service Level Name is required"),
    enabled: z.number().int().min(0).max(1).default(1),
    default_priority: z.enum(["Low", "Medium", "High", "Urgent"]).default("Medium"),
});

export type SLAData = z.infer<typeof SLASchema>;
