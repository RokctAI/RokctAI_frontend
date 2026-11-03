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
// Test stand-in for the host shell's app/config/platform.

export const PLATFORM_NAME = "rokct.ai";

/**
 * The shell's client-side branding cache, as agent-header-menu.ts reads it
 * (1.14.0): nothing on the server, and nothing here.
 */
export function getBrandingSync(): { code?: string; style?: Record<string, string | number> } | null {
  return null;
}
