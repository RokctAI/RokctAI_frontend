"use server";

import { getClient } from "@/app/lib/client";
import { verifyCrmRole } from "@/app/lib/roles";

export interface TimelineItem {
    id: string;
    type: "comment" | "system" | "email" | "version";
    content: string;
    owner: string;
    timestamp: string;
    subject?: string;
    link?: string;
}

export async function getTimeline(doctype: string, docname: string) {
    if (!await verifyCrmRole()) return { data: [], error: "Unauthorized" };
    const client = await getClient();

    try {
        // Fetch Comments, Communications (Emails), and Versions (Audit Log) in parallel
        const [comments, communications, versions] = await Promise.all([
            // 1. Comments
            (client as any).get_list("Comment", {
                filters: {
                    reference_doctype: doctype,
                    reference_name: docname,
                    comment_type: "Comment"
                },
                fields: ["name", "content", "owner", "creation", "subject"],
                order_by: "creation desc",
                limit_page_length: 50
            }),
            // 2. Communications (Emails)
            (client as any).get_list("Communication", {
                filters: {
                    reference_doctype: doctype,
                    reference_name: docname,
                    communication_type: "Communication" // Filter explicitly if needed, usually 'Communication' covers emails
                },
                fields: ["name", "content", "subject", "sender", "creation", "communication_medium"],
                order_by: "creation desc",
                limit_page_length: 20
            }),
            // 3. Versions (Audit Trail)
            (client as any).get_list("Version", {
                filters: {
                    ref_doctype: doctype,
                    docname: docname
                },
                fields: ["name", "data", "owner", "creation"],
                order_by: "creation desc",
                limit_page_length: 20
            })
        ]);

        const timeline: TimelineItem[] = [];

        // Normalize Comments
        (comments || []).forEach((c: any) => {
            timeline.push({
                id: c.name,
                type: "comment",
                content: c.content,
                owner: c.owner,
                timestamp: c.creation,
                subject: c.subject
            });
        });

        // Normalize Communications
        (communications || []).forEach((c: any) => {
            timeline.push({
                id: c.name,
                type: "email",
                content: c.content, // Often HTML
                owner: c.sender,
                timestamp: c.creation,
                subject: c.subject || "Email",
            });
        });

        // Normalize Versions
        (versions || []).forEach((v: any) => {
            // Frappe stores changes in 'data' field as JSON string often
            let changeSummary = "Document updated";
            try {
                const data = JSON.parse(v.data);
                if (data.changed && data.changed.length > 0) {
                    // Extract changed fields for better summary
                    const fields = data.changed.map((f: any) => Array.isArray(f) ? f[0] : f).join(", ");
                    changeSummary = `Updated fields: ${fields}`;
                }
            } catch (e) { }

            timeline.push({
                id: v.name,
                type: "version",
                content: changeSummary,
                owner: v.owner,
                timestamp: v.creation
            });
        });

        // Sort combined list by timestamp desc
        timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return { data: timeline };

    } catch (e) {
        console.error("Failed to fetch timeline", e);
        return { data: [], error: "Failed to load activity timeline" };
    }
}
