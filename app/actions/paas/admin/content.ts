/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use server";

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";

import { getPaaSClient } from "@/app/lib/client";

export async function getBrands(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.brand.get_brands", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return [];
  }
}

export async function getBanners(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_content.get_admin_banners", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch banners:", error);
    return [];
  }
}

export async function getBlogs(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    // api.blog.get_blogs paginates via limit/start and wraps its list in
    // an api_response envelope ({ data: [...] }) — unwrap to keep the
    // array contract this action always had.
    const res = await paasCall<any>("api.blog.get_blogs", { limit, start });
    return res?.data ?? [];
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return [];
  }
}

export async function getStories(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_content.get_admin_stories", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    return [];
  }
}

export async function getUnits(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_data.get_all_units", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch units:", error);
    return [];
  }
}

export async function getCareers(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.career.get_admin_careers", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch careers:", error);
    return [];
  }
}

export async function getCareerCategories(
  page: number = 1,
  limit: number = 20,
) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_content.get_all_career_categories", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch career categories:", error);
    return [];
  }
}

export async function getGallery(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_content.get_shop_gallery", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch gallery:", error);
    return [];
  }
}

export async function getNotifications(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_records.get_all_notifications", {
      limit_start: start,
      limit_page_length: limit,
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
        limit_page_length: 1000,
      },
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
          ...data,
        },
      },
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
        fieldname: data,
      },
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
        name: name,
      },
    });
    revalidatePath("/paas/admin/settings/faqs");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete FAQ:", error);
    throw error;
  }
}
