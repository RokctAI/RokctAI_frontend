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

import React from "react";
import Link from "next/link";
import Image from "next/image";

export function TeamsSection({ id }: { id?: string }) {
  return (
    <section id={id} className="container w-full mx-auto px-4 xl:px-0 py-12">
      <div className="relative flex w-full flex-col items-center justify-between gap-8 overflow-hidden rounded-[32px] bg-zinc-900 px-8 py-12 md:flex-row md:px-16 md:py-20">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent to-[#4F46E5]/20 opacity-50 -z-10"></div>

        <div className="flex flex-col items-center text-center md:items-start md:text-left gap-4 z-10">
          <h2 className="text-3xl font-black text-white md:text-5xl">
            Teams love us too!
          </h2>
          <p className="text-lg font-medium text-zinc-400">
            Want an end-to-end AI solution for your org? Let's talk.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row z-10">
          <Link
            href="/book-demo"
            className="flex h-fit w-fit items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-black transition-transform hover:scale-105"
          >
            Book a demo
          </Link>
          <Link
            href="/teams"
            className="flex h-fit w-fit items-center justify-center gap-2 rounded-full bg-transparent border border-white/20 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-white/10"
          >
            Discover Teams
          </Link>
        </div>
      </div>
    </section>
  );
}
