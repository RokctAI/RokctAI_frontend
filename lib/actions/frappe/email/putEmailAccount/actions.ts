"use server";
import { z } from "zod";

const EmailAccountSchema = z.object({
  "name": z.string().optional(),
  "account_section": z.any().optional(),
  "email_id": z.string().optional(),
  "company": z.string().optional(),
  "email_account_name": z.string().optional(),
  "column_break_3": z.any().optional(),
  "domain": z.string().optional(),
  "service": z.any().optional(),
  "authentication_column": z.any().optional(),
  "auth_method": z.any().optional(),
  "backend_app_flow": z.number().optional(),
  "authorize_api_access": z.any().optional(),
  "password": z.any().optional(),
  "awaiting_password": z.number().optional(),
  "ascii_encode_password": z.number().optional(),
  "column_break_10": z.any().optional(),
  "connected_app": z.string().optional(),
  "connected_user": z.string().optional(),
  "login_id_is_different": z.number().optional(),
  "login_id": z.string().optional(),
  "mailbox_settings": z.any().optional(),
  "enable_incoming": z.number().optional(),
  "default_incoming": z.number().optional(),
  "use_imap": z.number().optional(),
  "use_ssl": z.number().optional(),
  "use_starttls": z.number().optional(),
  "email_server": z.string().optional(),
  "incoming_port": z.string().optional(),
  "column_break_18": z.any().optional(),
  "attachment_limit": z.number().optional(),
  "email_sync_option": z.any().optional(),
  "initial_sync_count": z.any().optional(),
  "section_break_25": z.any().optional(),
  "imap_folder": z.array(z.object({"folder_name": z.string(), "append_to": z.string(), "uidvalidity": z.string(), "uidnext": z.string()})).optional(),
  "section_break_12": z.any().optional(),
  "append_emails_to_sent_folder": z.number().optional(),
  "sent_folder_name": z.string().optional(),
  "append_to": z.string().optional(),
  "create_contact": z.number().optional(),
  "enable_automatic_linking": z.number().optional(),
  "section_break_13": z.any().optional(),
  "notify_if_unreplied": z.number().optional(),
  "unreplied_for_mins": z.number().optional(),
  "send_notification_to": z.any().optional(),
  "outgoing_mail_settings": z.any().optional(),
  "enable_outgoing": z.number().optional(),
  "use_tls": z.number().optional(),
  "use_ssl_for_outgoing": z.number().optional(),
  "smtp_server": z.string().optional(),
  "smtp_port": z.string().optional(),
  "column_break_38": z.any().optional(),
  "default_outgoing": z.number().optional(),
  "always_use_account_email_id_as_sender": z.number().optional(),
  "always_use_account_name_as_sender_name": z.number().optional(),
  "send_unsubscribe_message": z.number().optional(),
  "track_email_status": z.number().optional(),
  "no_smtp_authentication": z.number().optional(),
  "always_bcc": z.string().optional(),
  "signature_section": z.any().optional(),
  "add_signature": z.number().optional(),
  "signature": z.any().optional(),
  "auto_reply": z.any().optional(),
  "enable_auto_reply": z.number().optional(),
  "auto_reply_message": z.any().optional(),
  "set_footer": z.any().optional(),
  "footer": z.any().optional(),
  "brand_logo": z.any().optional(),
  "uidvalidity": z.string().optional(),
  "uidnext": z.number().optional(),
  "no_failed": z.number().optional()
});

export type EmailAccount = z.infer<typeof EmailAccountSchema>;

export async function updateEmailAccount(name: string, doc: Partial<EmailAccount>, apiKey: string, apiSecret: string): Promise<EmailAccount> {
  const response = await fetch(`/api/v1/resource/Email%20Account/${encodeURIComponent(name)}`, {
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
    throw new Error(`Failed to update email account: ${errorBody}`);
  }
  
  
  
  const result = await response.json();
  return result.data;
}