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

// EN | AF in the header (Ray, 2026-11-20: "since all sites have afrikaans
// cant we show a toggle"; approved look: a pill beside the theme button with
// a highlight that slides to the chosen language). Picking a language writes
// the rk-lang cookie for a year, sets <html lang> and refreshes the route so
// server and client copy both re-render in it. It only shows in a host whose
// app/lib/i18n can switch language (exports currentLocale); in an older host
// it draws nothing rather than a control that does nothing.
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import * as i18n from "@/app/lib/i18n";
import t from "@/app/lib/i18n";
import { cn } from "@/lib/utils";

const COOKIE = "rk-lang";
const LANGS = [
  { code: "en", label: "EN", name: "English" },
  { code: "af", label: "AF", name: "Afrikaans" },
] as const;
type Lang = (typeof LANGS)[number]["code"];

const supported =
  typeof (i18n as Record<string, unknown>).currentLocale === "function";

export function LanguageToggle({ className }: { className?: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    setLang(document.documentElement.lang === "af" ? "af" : "en");
  }, []);

  if (!supported) return null;

  const choose = (next: Lang) => {
    if (next === lang) return;
    document.cookie = `${COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    setLang(next);
    startTransition(() => router.refresh());
  };

  return (
    <div
      role="group"
      aria-label={t("base.language")}
      className={cn(
        "relative inline-flex h-8 items-center rounded-full border border-border p-0.5 text-xs font-semibold tracking-wide",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0.5 top-0.5 h-[26px] w-[34px] rounded-full bg-foreground/10",
          "transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          lang === "af" && "translate-x-[34px]",
        )}
      />
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          aria-pressed={lang === l.code}
          aria-label={l.name}
          onClick={() => choose(l.code)}
          className={cn(
            "relative z-10 h-[26px] w-[34px] rounded-full transition-colors duration-150 ease-out",
            lang === l.code
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

export default LanguageToggle;
