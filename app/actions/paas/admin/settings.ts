"use server";

import { revalidatePath } from "next/cache";

import { getPaaSClient } from "@/app/lib/client";

export async function getGeneralSettings() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.api.admin_settings.admin_settings.get_general_settings"
        });
    } catch (error) {
        console.error("Failed to fetch general settings:", error);
        return {};
    }
}

export async function updateGeneralSettings(settings: any) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "paas.api.admin_settings.admin_settings.update_general_settings",
            args: { settings_data: settings }
        });
        revalidatePath("/paas/admin/settings/general");
        return { success: true };
    } catch (error) {
        console.error("Failed to update general settings:", error);
        throw error;
    }
}

export async function getCurrencies(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_settings.admin_settings.get_all_currencies",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch currencies:", error);
        return [];
    }
}

export async function getPaymentMethods() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.api.admin_settings.admin_settings.get_payment_methods"
        });
    } catch (error) {
        console.error("Failed to fetch payment methods:", error);
        return [];
    }
}

export async function updatePaymentMethod(name: string, enabled: boolean) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "frappe.client.set_value",
            args: {
                doctype: "PaaS Payment Gateway",
                name: name,
                fieldname: "enabled",
                value: enabled ? 1 : 0
            }
        });
        revalidatePath("/paas/admin/settings/payments");
        return { success: true };
    } catch (error) {
        console.error("Failed to update payment method:", error);
        throw error;
    }
}

export async function getPaymentGateway(name: string) {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "PaaS Payment Gateway",
                name: name
            }
        });
    } catch (error) {
        console.error("Failed to fetch payment gateway:", error);
        return null;
    }
}

export async function savePaymentGateway(doc: any) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "frappe.client.save",
            args: {
                doc: doc
            }
        });
        revalidatePath("/paas/admin/settings/payments");
        return { success: true };
    } catch (error) {
        console.error("Failed to save payment gateway:", error);
        throw error;
    }
}

export async function getEmailSettings() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.api.admin_settings.admin_settings.get_email_settings"
        });
    } catch (error) {
        console.error("Failed to fetch email settings:", error);
        return {};
    }
}

export async function getNotificationSettings() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.api.admin_settings.admin_settings.get_notification_settings"
        });
    } catch (error) {
        console.error("Failed to fetch notification settings:", error);
        return {};
    }
}

export async function getSocialSettings() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.api.admin_settings.admin_settings.get_social_settings"
        });
    } catch (error) {
        console.error("Failed to fetch social settings:", error);
        return {};
    }
}

export async function getAppSettings() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.api.admin_settings.admin_settings.get_app_settings"
        });
    } catch (error) {
        console.error("Failed to fetch app settings:", error);
        return {};
    }
}

export async function getPages(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_content.admin_content.get_all_pages",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch pages:", error);
        return [];
    }
}

export async function getPermissionSettings() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "frappe.client.get",
            args: { doctype: "Permission Settings" }
        });
    } catch (error) {
        console.error("Failed to fetch permission settings:", error);
        return {};
    }
}



export async function updatePermissionSettings(settings: any) {
    const frappe = await getPaaSClient();
    try {
        const doc = await frappe.call({
            method: "frappe.client.get",
            args: { doctype: "Permission Settings" }
        });

        await frappe.call({
            method: "frappe.client.set_value",
            args: {
                doctype: "Permission Settings",
                name: doc.name,
                fieldname: settings
            }
        });

        revalidatePath("/paas/admin/settings/permissions");
        return { success: true };
    } catch (error) {
        console.error("Failed to update permission settings:", error);
        throw error;
    }
}

export async function getAvailableSourceProjects() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.paas.builder.utils.get_available_source_projects"
        });
    } catch (error) {
        console.error("Failed to fetch available source projects:", error);
        return [];
    }
}

export async function getFlutterAppSettings() {
    const frappe = await getPaaSClient();
    try {
        // Fetch the list of Flutter App Configurations
        return await frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Flutter App Configuration",
                fields: ["*"],
                limit_page_length: 100
            }
        });
    } catch (error) {
        console.error("Failed to fetch flutter app settings:", error);
        return [];
    }
}

export async function getFlutterAppConfig(name: string) {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "frappe.client.get",
            args: { doctype: "Flutter App Configuration", name: name }
        });
    } catch (error) {
        console.error("Failed to fetch flutter app config:", error);
        return null;
    }
}

export async function updateFlutterAppSettings(name: string, settings: any) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "frappe.client.set_value",
            args: {
                doctype: "Flutter App Configuration",
                name: name,
                fieldname: settings
            }
        });

        revalidatePath("/paas/admin/settings/flutter");
        return { success: true };
    } catch (error) {
        console.error("Failed to update flutter app settings:", error);
        throw error;
    }
}

export async function createFlutterAppConfig(settings: any) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Flutter App Configuration",
                    ...settings
                }
            }
        });
        revalidatePath("/paas/admin/settings/flutter");
        return { success: true };
    } catch (error) {
        console.error("Failed to create flutter app config:", error);
        throw error;
    }
}

export async function getFlutterBuildSettings() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "frappe.client.get",
            args: { doctype: "Flutter Build Settings" }
        });
    } catch (error) {
        console.error("Failed to fetch flutter build settings:", error);
        return {};
    }
}

export async function updateFlutterBuildSettings(settings: any) {
    const frappe = await getPaaSClient();
    try {
        const doc = await frappe.call({
            method: "frappe.client.get",
            args: { doctype: "Flutter Build Settings" }
        });

        await frappe.call({
            method: "frappe.client.set_value",
            args: {
                doctype: "Flutter Build Settings",
                name: doc.name,
                fieldname: settings
            }
        });

        revalidatePath("/paas/admin/settings/flutter");
        return { success: true };
    } catch (error) {
        console.error("Failed to update flutter build settings:", error);
        throw error;
    }
}

export async function getSystemInfo() {
    const frappe = await getPaaSClient();
    try {
        const [infoRes, versionRes] = await Promise.allSettled([
            frappe.call({ method: "paas.api.admin_settings.admin_settings.get_system_info" }),
            frappe.call({ method: "paas.api.get_version" })
        ]);

        const info = infoRes.status === 'fulfilled' ? ((infoRes.value as any).message || infoRes.value) : {};
        const version = versionRes.status === 'fulfilled' ? ((versionRes.value as any).message || versionRes.value) : null;

        return {
            ...info,
            version: version
        };
    } catch (error) {
        console.error("Failed to fetch system info:", error);
        return {};
    }
}

export async function getTerms() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Terms and Conditions",
                fields: ["name", "title", "terms", "disabled"],
                order_by: "creation desc",
                limit_page_length: 1000
            }
        });
    } catch (error) {
        console.error("Failed to fetch Terms:", error);
        return [];
    }
}

export async function createTerm(data: any) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Terms and Conditions",
                    ...data
                }
            }
        });
        revalidatePath("/paas/admin/settings/terms");
        return { success: true };
    } catch (error) {
        console.error("Failed to create Term:", error);
        throw error;
    }
}

export async function updateTerm(name: string, data: any) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "frappe.client.set_value",
            args: {
                doctype: "Terms and Conditions",
                name: name,
                fieldname: data
            }
        });
        revalidatePath("/paas/admin/settings/terms");
        return { success: true };
    } catch (error) {
        console.error("Failed to update Term:", error);
        throw error;
    }
}

export async function deleteTerm(name: string) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "frappe.client.delete",
            args: {
                doctype: "Terms and Conditions",
                name: name
            }
        });
        revalidatePath("/paas/admin/settings/terms");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete Term:", error);
        throw error;
    }
}

export async function getPrivacyPolicies() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Privacy Policy",
                fields: ["name", "title", "content", "active"],
                order_by: "creation desc",
                limit_page_length: 1000
            }
        });
    } catch (error) {
        console.error("Failed to fetch Privacy Policies:", error);
        return [];
    }
}

export async function createPrivacyPolicy(data: any) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Privacy Policy",
                    ...data
                }
            }
        });
        revalidatePath("/paas/admin/settings/privacy");
        return { success: true };
    } catch (error) {
        console.error("Failed to create Privacy Policy:", error);
        throw error;
    }
}

export async function getLandingPage() {
    const frappe = await getPaaSClient();
    try {
        // Assuming 'home' is the route for the landing page
        return await frappe.call({
            method: "paas.api.page.page.get_admin_web_page",
            args: { route: "home" }
        });
    } catch (error) {
        console.error("Failed to fetch landing page:", error);
        return null;
    }
}

export async function updateLandingPage(data: any) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "paas.api.page.page.update_admin_web_page",
            args: {
                route: "home",
                page_data: data
            }
        });
        revalidatePath("/paas/admin/settings/landing");
        return { success: true };
    } catch (error) {
        console.error("Failed to update landing page:", error);
        throw error;
    }
}

export async function updatePrivacyPolicy(name: string, data: any) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "frappe.client.set_value",
            args: {
                doctype: "Privacy Policy",
                name: name,
                fieldname: data
            }
        });
        revalidatePath("/paas/admin/settings/privacy");
        return { success: true };
    } catch (error) {
        console.error("Failed to update Privacy Policy:", error);
        throw error;
    }
}

export async function deletePrivacyPolicy(name: string) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "frappe.client.delete",
            args: {
                doctype: "Privacy Policy",
                name: name
            }
        });
        revalidatePath("/paas/admin/settings/privacy");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete Privacy Policy:", error);
        throw error;
    }
}
