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

// The closing "Ask ROK anything." box (1.24.0), rendered by
// rokct-closing.tsx. Its placeholder types through the copy's sample
// questions the way the concept's does; sending it opens `target` - the
// chat for a signed-in visitor, sign-up otherwise (neither page takes a
// question in its address yet, so the words are not carried over).

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RiArrowRightLine } from "@remixicon/react";

import { RK_FINAL } from "@/components/custom/landing/rokct-landing-content";

function useTypedPlaceholder(lines: readonly string[]): string {
  const [text, setText] = useState(lines[0] ?? "");
  useEffect(() => {
    if (lines.length === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let line = 0;
    let chars = 0;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      const current = lines[line % lines.length];
      chars += 1;
      setText(current.slice(0, chars));
      if (chars < current.length) {
        timer = setTimeout(step, 55);
      } else {
        timer = setTimeout(() => {
          line += 1;
          chars = 0;
          setText("");
          step();
        }, 2200);
      }
    };
    timer = setTimeout(() => {
      setText("");
      step();
    }, 2200);
    return () => clearTimeout(timer);
  }, [lines]);
  return text;
}

export function RokctAskBox({ target }: { target: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const placeholder = useTypedPlaceholder(RK_FINAL.placeholders);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(target);
  };

  return (
    <form className="rk-input" onSubmit={submit}>
      <label htmlFor="rk-ask-q" className="rk-sr">
        {RK_FINAL.label}
      </label>
      <input
        id="rk-ask-q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      <button type="submit" className="rk-send" aria-label="Ask ROK">
        <RiArrowRightLine className="rk-ico" aria-hidden="true" />
      </button>
    </form>
  );
}
