/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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

/**
 * Action kit: the cross-cutting concerns every server action in this repo
 * re-implements by hand today, composed once.
 *
 * Today the same backend operations exist twice:
 *   - app/actions/handson/** — session + role guard (app/lib/roles.ts) ->
 *     service class -> revalidatePath, returning `{ success, ... }` for
 *     mutations and a plain fallback value (e.g. []) for list reads.
 *   - app/actions/ai/**      — session + AI token quota (app/lib/usage.ts
 *     checkTokenQuota/recordTokenUsage) -> gateway call, returning
 *     `{ success, ... }`.
 *
 * `runAction` (mutations / enveloped reads) and `runQuery` (fallback-shaped
 * list reads) compose session check, optional role guard, optional AI quota
 * billing, revalidation, and error trapping, so a domain module can define
 * ONE canonical implementation that both the hands-on page path and the AI
 * path import. See app/actions/domains/hr/goals.ts for the exemplar.
 */

import { revalidatePath } from "next/cache";
import type { Session } from "next-auth";

import { auth } from "@/app/(auth)/auth";
import {
  ACTION_TOKEN_COST,
  checkTokenQuota,
  recordTokenUsage,
} from "@/app/lib/usage";
import { AI_MODELS } from "@/ai/models";

export interface ActionOptions {
  /**
   * Role guard, e.g. `verifyHrRole` from app/lib/roles. When it resolves
   * false the action fails with "Unauthorized" before touching the backend.
   */
  role?: () => Promise<boolean>;
  /**
   * Bill this call against the caller's AI token quota (the app/actions/ai
   * pattern): checkTokenQuota before running, recordTokenUsage (flat
   * ACTION_TOKEN_COST, fire-and-forget) after success. Omit for the
   * hands-on page path, which is not quota-billed.
   */
  ai?: { modelId?: string };
  /** Path(s) revalidated after a successful mutation. */
  revalidate?: string | string[];
  /** Error message used when a thrown error carries no message. */
  fallbackError?: string;
}

export type ActionFailure = { success: false; error: string };
export type ActionResult<T extends Record<string, unknown>> =
  ({ success: true } & T) | ActionFailure;

/**
 * Run a guarded, enveloped action. Returns `{ success: true, ...result }`
 * or `{ success: false, error }` — the shape both action families already
 * use for mutations.
 */
export async function runAction<T extends Record<string, unknown>>(
  options: ActionOptions,
  fn: (session: Session) => Promise<T>,
): Promise<ActionResult<T>> {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }
  if (options.role && !(await options.role())) {
    return { success: false, error: "Unauthorized" };
  }
  if (options.ai && !(await checkTokenQuota(session))) {
    return { success: false, error: "Quota exceeded." };
  }

  try {
    const result = await fn(session);

    const paths =
      typeof options.revalidate === "string"
        ? [options.revalidate]
        : (options.revalidate ?? []);
    for (const path of paths) {
      revalidatePath(path);
    }

    if (options.ai) {
      // Fire-and-forget billing, mirroring app/actions/ai/** today.
      recordTokenUsage(
        session,
        ACTION_TOKEN_COST,
        options.ai.modelId || AI_MODELS.FREE.id,
      );
    }

    return { ...result, success: true as const };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || options.fallbackError || "Unknown error",
    };
  }
}

/**
 * Run a guarded read that degrades to a fallback value instead of an error
 * envelope — the shape the hands-on list actions use (e.g. `[]` when the
 * role check fails or the backend call throws).
 */
export async function runQuery<T>(
  options: Pick<ActionOptions, "role">,
  fn: (session: Session) => Promise<T>,
  fallback: T,
  label?: string,
): Promise<T> {
  const session = await auth();
  if (!session?.user?.email) return fallback;
  if (options.role && !(await options.role())) return fallback;

  try {
    return await fn(session);
  } catch (e) {
    console.error(label ? `Failed to ${label}` : "Query action failed", e);
    return fallback;
  }
}
