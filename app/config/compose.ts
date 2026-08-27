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
