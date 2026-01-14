"use server";

import { EventService } from "@/app/services/all/lms/events";
import { verifyLmsRole } from "@/app/lib/roles";

export async function fetchMyLiveClasses() {
    if (!await verifyLmsRole()) return [];
    return await EventService.getMyLiveClasses();
}

export async function fetchUpcomingEvaluations() {
    if (!await verifyLmsRole()) return [];
    return await EventService.getUpcomingEvaluations();
}
