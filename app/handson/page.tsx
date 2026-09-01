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

import Link from "next/link";
import { RedirectType, redirect } from "next/navigation";

export default async function HandsOnMode() {
  // This shell serves control-plane (rokctapp) users only — the paas product
  // has its own app shell repo (delivery-frontend), so there is no
  // paas-tenant branch here anymore.
  redirect("/handson/control", RedirectType.replace);

  return (
    <div className="flex flex-col items-center justify-center h-[50vh] p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
    </div>
  );
}
