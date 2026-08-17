"use server";

import { paasCall } from "@/app/lib/paas-gateway";

export async function getUsers(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_management.get_all_users", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function getRoles(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_management.get_all_roles", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    return [];
  }
}

export async function getPoints(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_data.get_all_points", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch points:", error);
    return [];
  }
}

export async function getReferrals(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_data.get_all_referrals", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch referrals:", error);
    return [];
  }
}
