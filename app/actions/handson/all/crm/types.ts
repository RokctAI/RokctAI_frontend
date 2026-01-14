import { z } from "zod";

export const LeadSchema = z.object({
    lead_name: z.string().min(1, "Name is required"),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    organization: z.string().optional(),
    email_id: z.string().email("Invalid email").optional().or(z.literal("")),
    mobile_no: z.string().optional(),
    status: z.string().optional(),
    id_number: z.string().optional(),
    kyc_status: z.enum(["Pending", "Verified", "Rejected"]).optional(),
    industry: z.string().optional(),
    lead_owner: z.string().optional(),
});

export type LeadData = z.infer<typeof LeadSchema>;
