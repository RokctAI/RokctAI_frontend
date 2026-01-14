"use server";

import { revalidatePath } from "next/cache";

import { getPaaSClient } from "@/app/lib/client";

export async function getBrands(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_content.admin_content.get_all_brands",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch brands:", error);
        return [];
    }
}

export async function getBanners(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_content.admin_content.get_all_banners",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch banners:", error);
        return [];
    }
}

export async function getBlogs(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_content.admin_content.get_all_blogs",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch blogs:", error);
        return [];
    }
}

export async function getStories(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_content.admin_content.get_all_stories",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch stories:", error);
        return [];
    }
}

export async function getUnits(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_data.admin_data.get_all_units",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch units:", error);
        return [];
    }
}

export async function getCareers(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_content.admin_content.get_all_careers",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch careers:", error);
        return [];
    }
}

export async function getCareerCategories(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_content.admin_content.get_all_career_categories",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch career categories:", error);
        return [];
    }
}

export async function getGallery(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_content.admin_content.get_shop_gallery",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch gallery:", error);
        return [];
    }
}

export async function getNotifications(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_content.admin_content.get_all_notifications",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return [];
    }
}

export async function getFAQs() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "FAQ",
                fields: ["name", "question", "answer", "type", "active"],
                order_by: "creation desc",
                limit_page_length: 1000
            }
        });
    } catch (error) {
        console.error("Failed to fetch FAQs:", error);
        return [];
    }
}

export async function createFAQ(data: any) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "FAQ",
                    ...data
                }
            }
        });
        revalidatePath("/paas/admin/settings/faqs");
        return { success: true };
    } catch (error) {
        console.error("Failed to create FAQ:", error);
        throw error;
    }
}

export async function updateFAQ(name: string, data: any) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "frappe.client.set_value",
            args: {
                doctype: "FAQ",
                name: name,
                fieldname: data
            }
        });
        revalidatePath("/paas/admin/settings/faqs");
        return { success: true };
    } catch (error) {
        console.error("Failed to update FAQ:", error);
        throw error;
    }
}

export async function deleteFAQ(name: string) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "frappe.client.delete",
            args: {
                doctype: "FAQ",
                name: name
            }
        });
        revalidatePath("/paas/admin/settings/faqs");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete FAQ:", error);
        throw error;
    }
}
