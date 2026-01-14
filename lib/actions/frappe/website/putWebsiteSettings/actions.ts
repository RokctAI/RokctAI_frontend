"use server";
import { z } from "zod";

const WebsiteSettingsSchema = z.object({
  "name": z.string().optional(),
  "home_tab": z.any().optional(),
  "sb0": z.any().optional(),
  "home_page": z.string().optional(),
  "cb4": z.any().optional(),
  "title_prefix": z.string().optional(),
  "misc_section": z.any().optional(),
  "app_name": z.string().optional(),
  "disable_signup": z.number().optional(),
  "show_footer_on_login": z.number().optional(),
  "column_break_9": z.any().optional(),
  "app_logo": z.any().optional(),
  "section_break_6": z.any().optional(),
  "website_theme": z.string().optional(),
  "website_theme_image": z.any().optional(),
  "website_theme_image_link": z.any().optional(),
  "navbar_tab": z.any().optional(),
  "brand": z.any().optional(),
  "banner_image": z.any().optional(),
  "splash_image": z.any().optional(),
  "brand_html": z.any().optional(),
  "set_banner_from_image": z.any().optional(),
  "favicon": z.any().optional(),
  "top_bar": z.any().optional(),
  "top_bar_items": z.array(z.object({"label": z.string(), "url": z.string(), "open_in_new_tab": z.number(), "right": z.number(), "column_break_5": z.any(), "parent_label": z.any()})).optional(),
  "hide_login": z.number().optional(),
  "navbar_search": z.number().optional(),
  "show_language_picker": z.number().optional(),
  "navbar_template_section": z.any().optional(),
  "navbar_template": z.string().optional(),
  "navbar_template_values": z.any().optional(),
  "edit_navbar_template_values": z.any().optional(),
  "call_to_action": z.string().optional(),
  "call_to_action_url": z.string().optional(),
  "banner": z.any().optional(),
  "banner_html": z.any().optional(),
  "footer_tab": z.any().optional(),
  "footer": z.any().optional(),
  "footer_items": z.array(z.object({"label": z.string(), "url": z.string(), "open_in_new_tab": z.number(), "right": z.number(), "column_break_5": z.any(), "parent_label": z.any()})).optional(),
  "footer_details_section": z.any().optional(),
  "copyright": z.string().optional(),
  "footer_logo": z.any().optional(),
  "hide_footer_signup": z.number().optional(),
  "column_break_37": z.any().optional(),
  "address": z.any().optional(),
  "footer_powered": z.any().optional(),
  "custom_footer_section": z.any().optional(),
  "footer_template": z.string().optional(),
  "footer_template_values": z.any().optional(),
  "edit_footer_template_values": z.any().optional(),
  "integrations": z.any().optional(),
  "analytics_section": z.any().optional(),
  "enable_view_tracking": z.number().optional(),
  "enable_google_indexing": z.number().optional(),
  "authorize_api_indexing_access": z.any().optional(),
  "indexing_refresh_token": z.string().optional(),
  "indexing_authorization_code": z.string().optional(),
  "column_break_17": z.any().optional(),
  "google_analytics_id": z.string().optional(),
  "google_analytics_anonymize_ip": z.number().optional(),
  "account_deletion_settings_section": z.any().optional(),
  "auto_account_deletion": z.number().optional(),
  "show_account_deletion_link": z.number().optional(),
  "section_break_38": z.any().optional(),
  "subdomain": z.any().optional(),
  "head_html": z.any().optional(),
  "robots_txt": z.any().optional(),
  "redirects_tab": z.any().optional(),
  "route_redirects": z.array(z.object({"source": z.any(), "target": z.any(), "redirect_http_status": z.any()})).optional()
});

export type WebsiteSettings = z.infer<typeof WebsiteSettingsSchema>;

export async function updateWebsiteSettings(doc: Partial<WebsiteSettings>, apiKey: string, apiSecret: string): Promise<WebsiteSettings> {
  const response = await fetch(`/api/v1/resource/Website%20Settings`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${apiKey}:${apiSecret}`,
      "X-Action-Source": "AI",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(doc),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to update website settings: ${errorBody}`);
  }
  
  
  
  const result = await response.json();
  return result.data;
}