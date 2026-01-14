"use server";

import { IntegrationService, IntegrationApp } from "@/app/services/tenant/integrations";

/**
 * Fetches the status of all integrations.
 */
export async function getIntegrations(): Promise<IntegrationApp[]> {
    return await IntegrationService.getIntegrations();
}

export async function connectIntegration(serviceName: string, config: any) {
    return await IntegrationService.connectIntegration(serviceName, config);
}

export async function disconnectIntegration(serviceName: string) {
    return await IntegrationService.disconnectIntegration(serviceName);
}
