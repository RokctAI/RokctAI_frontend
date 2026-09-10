/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
// Test stand-in for base_sdk's app/services/base/platform-gateway: records
// every call and answers through `gateway.answer`, which a test replaces.

export type GatewayFailure = "http_error" | "network_error" | "timeout";

export class PlatformGatewayError extends Error {
  reason: GatewayFailure;
  status?: number;
  constructor(reason: GatewayFailure, status?: number) {
    super(`${reason}${status ? ` ${status}` : ""}`);
    this.reason = reason;
    this.status = status;
  }
}

export interface RecordedCall {
  cmd: string;
  payload: unknown;
  options: Record<string, unknown> | undefined;
}

export const gateway: {
  calls: RecordedCall[];
  answer: (call: RecordedCall) => unknown;
  reset: () => void;
} = {
  calls: [],
  answer: () => null,
  reset() {
    gateway.calls = [];
    gateway.answer = () => null;
  },
};

export async function platformCall<T = unknown>(
  cmd: string,
  payload?: unknown,
  options?: Record<string, unknown>,
): Promise<T> {
  const call = { cmd, payload, options };
  gateway.calls.push(call);
  return (await gateway.answer(call)) as T;
}
