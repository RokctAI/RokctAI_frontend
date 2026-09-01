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

// Compose-time SDK flags for the shell.
//
// Entries between the markers below are injected by the Rokct SDK installer
// (sdk_installer_base.py update_integrations()) — the same contract as the
// nav marker in app/handson/sidebar-client.tsx. Each installed SDK's
// manifest declares a `<flag>: true,` line that is inserted on a new line
// immediately after the start marker. Do not remove or reformat the marker
// comments inside the object literal.
const sdkFlags: Record<string, boolean> = {
  // @rokct-sdk-flags-start
  // @rokct-sdk-flags-end
};

// The chat surface now ships in the agent SDK, so the bare shell defaults to
// hands-on mode. Composing the agent SDK installs the chat surface and its
// manifest injects `agent: true,` at the marker, flipping the shell back to
// AI-first.
export const AI_FIRST = sdkFlags.agent ?? false;
