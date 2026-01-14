"use server";

import { BatchService } from "@/app/services/all/lms/batches";
import { verifyLmsRole } from "@/app/lib/roles";

export async function fetchMyBatches() {
    if (!await verifyLmsRole()) return [];
    return await BatchService.getMyBatches();
}
