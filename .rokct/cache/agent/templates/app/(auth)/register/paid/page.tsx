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
// register/paid: where PayFast sends a paid-plan web sign-up back to
// (the hub's payfast_return_url). Client half: agent-paid-signup.tsx.

import AgentPaidSignup from "@/components/custom/auth/agent-paid-signup";

export const dynamic = "force-dynamic";

export default function RegisterPaidPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <AgentPaidSignup />
      </div>
    </main>
  );
}
