import { getGuestClient } from "@/app/lib/client";
import { GlobalSettingsService } from "@/app/services/control/global_settings";

export class VersionsService {
    static async getPublicVersions() {
        const frappe = getGuestClient();

        const settings = await GlobalSettingsService.getGlobalSettings();
        const isDebug = settings?.isDebugMode ?? false;

        // Use fetch for rokct to ensure headers are passed reliably
        const rokctFetch = fetch(
            `${process.env.ROKCT_BASE_URL}/api/method/rokct.rokct.api.versions.get_versions`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...(isDebug ? { "X-Rokct-Debug": "true" } : {})
                },
                next: { revalidate: 300 } // Cache for 5 mins
            }
        ).then(res => res.json()).catch(() => ({}));

        const [rokctRes, paasRes, rpanelRes] = await Promise.allSettled([
            rokctFetch,
            frappe.call({ method: "paas.api.get_version" }),
            frappe.call({ method: "rpanel.api.get_version" })
        ]);

        const rokctDataRaw = rokctRes.status === 'fulfilled' ? rokctRes.value : {};
        const rokctData = rokctDataRaw.message || rokctDataRaw || {};
        const paasVer = paasRes.status === 'fulfilled' ? (paasRes.value.message || paasRes.value) : null;
        const rpanelVer = rpanelRes.status === 'fulfilled' ? (rpanelRes.value.message || rpanelRes.value) : null;

        // Merge datas
        const versions = {
            ...rokctData,
        };

        // Override or ensure specific versions if direct calls succeeded
        if (paasVer) {
            versions['paas'] = { title: 'PaaS', version: paasVer };
        }
        if (rpanelVer) {
            versions['rpanel'] = { title: 'RPanel', version: rpanelVer };
        }

        return versions;
    }
}
