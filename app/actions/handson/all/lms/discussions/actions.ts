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

import { DiscussionService } from "@/app/services/all/lms/discussions";
import { revalidatePath } from "next/cache";
import { DiscussionReply } from "./types";
import { z } from "zod";
import { verifyLmsRole } from "@/app/lib/roles";

const CreateTopicSchema = z.object({
  doctype: z.string().min(1),
  docname: z.string().min(1),
  title: z.string().min(3),
});

const CreateReplySchema = z.object({
  topic: z.string().min(1),
  reply: z.string().min(1),
});

export async function fetchDiscussionTopics(doctype: string, docname: string) {
  if (!(await verifyLmsRole())) return [];
  return await DiscussionService.getTopics(doctype, docname);
}

export async function createDiscussionTopicAction(
  doctype: string,
  docname: string,
  title: string,
) {
  if (!(await verifyLmsRole()))
    return { success: false, error: "Unauthorized" };

  const valid = CreateTopicSchema.safeParse({ doctype, docname, title });
  if (!valid.success) return { success: false, error: valid.error.message };

  try {
    await DiscussionService.createTopic(doctype, docname, title);
    revalidatePath(`/handson/all/lms`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchDiscussionReplies(topic: string) {
  if (!(await verifyLmsRole())) return [];
  return await DiscussionService.getReplies(topic);
}

export async function createDiscussionReplyAction(
  topic: string,
  reply: string,
  path?: string,
) {
  if (!(await verifyLmsRole()))
    return { success: false, error: "Unauthorized" };

  const valid = CreateReplySchema.safeParse({ topic, reply });
  if (!valid.success) return { success: false, error: valid.error.message };

  try {
    await DiscussionService.createReply(topic, reply);
    if (path) revalidatePath(path);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
