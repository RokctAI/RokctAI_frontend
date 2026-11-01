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


// The page that serves `/` in a shell whose home SDK is corporate_sdk - a
// local-data site. The site has no signed-in surface, so every visitor goes
// to base_sdk's composed landing at /landing, which draws the page from the
// shell's data/ folder. Installed only through the manifest's "home" block.

import { redirect } from "next/navigation";

export default function Page() {
  redirect("/landing");
}
