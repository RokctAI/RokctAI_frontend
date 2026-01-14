import { z } from "zod";

export const EmployeeProfileSchema = z.object({
    first_name: z.string().min(1, "First Name is required"),
    last_name: z.string().optional(),
    contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
    id_number: z.string().optional(),
    tax_id: z.string().optional(),
    bank_name: z.string().optional(),
    bank_account_no: z.string().optional(),
    bank_branch_code: z.string().optional(),
    company: z.string().optional(),
    department: z.string().optional(),
    designation: z.string().optional(),
    status: z.string().optional(),
    date_of_joining: z.string().optional(),
});

export type EmployeeProfileData = z.infer<typeof EmployeeProfileSchema>;
