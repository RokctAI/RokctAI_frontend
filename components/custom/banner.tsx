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

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AI_MODELS } from "@/ai/models";

export function Banner() {
  return (
    <div className="bg-gray-900 text-white text-center py-2">
      <div className="container mx-auto">
        <p className="font-semibold">
          <span className="bg-wealth-green-500 text-white text-xs font-bold rounded-full px-2 py-1 mr-2">
            NEW
          </span>
          {AI_MODELS.PAID.label} is now available!
          <a href="#" className="ml-2 underline">
            Try it now
          </a>
        </p>
      </div>
    </div>
  );
}
