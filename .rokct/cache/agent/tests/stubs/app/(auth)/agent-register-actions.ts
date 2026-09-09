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
// Test stand-in for this SDK's app/(auth)/agent-register-actions (a "use
// server" module the register config's industry field calls): answers
// whatever a test put in `industries.answer`.

export const industries: { answer: string[] } = { answer: [] };

export async function getIndustries(): Promise<string[]> {
  return industries.answer;
}
