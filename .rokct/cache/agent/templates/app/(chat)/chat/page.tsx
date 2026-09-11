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

// /chat is the root chat page under a second path (agent_sdk 1.19.0).
//
// The landing's "Chat with ROK" header action and AI Chat entry, the chat
// section's "Explore now" and the landing config's chat CTA all link to
// /chat, but the chat surface is ../page.tsx at `/` and the only file under
// chat/ was [id]/page.tsx, so /chat matched nothing and 404'd on the
// composed shell. This file is that route: it hands Next the same default
// export, so a guest is sent to /landing (or shown the PaaS login when
// ?site_name= is set) exactly as at `/`, and a signed-in visitor archives
// the last session and is sent to a fresh /chat/<id> exactly as at `/`.
// Nothing is duplicated: the page's logic, imports and gateway call live in
// ../page.tsx alone. The root page exports no metadata or route config, so
// there is nothing else to forward.

export { default } from "../page";
