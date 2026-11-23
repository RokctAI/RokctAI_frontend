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

// The register page's "Verify your email" step (auth_sdk post-account step,
// declared in ./agent-register-config.ts). The hub (platform.rokct.ai)
// emailed a 6-digit code when sign-up opened the onboarding session; the
// visitor types it here while the tenant site is still being built (Ray
// 2026-11-22: the PIN is a buffer, verify early). "Send a new code" shows
// from the start. Drawn in the hub's Sticks theme (../hub/hub-theme.css,
// Ray approved the pin3 renders). Server half: app/(auth)/agent-onboarding-pin.ts.
// A visitor with no hub session (a Service plan) passes straight through.

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

import type { RegisterStepProps } from "@/components/custom/auth/register-registry";
import {
  onboardingPinState,
  resendOnboardingPin,
  verifyOnboardingPin,
} from "@/app/(auth)/agent-onboarding-pin";
import { HubTheme } from "@/components/custom/hub/hub-theme";
import { tx } from "@/app/lib/i18n/phrases";

const LENGTH = 6;

export default function AgentVerifyPinStep({ next, email }: RegisterStepProps) {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [wait, setWait] = useState(0);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let live = true;
    onboardingPinState().then((state) => {
      if (!live) return;
      if (state.status === "none" || state.status === "verified") next();
      else {
        if (state.status === "error") setError(state.error);
        setReady(true);
      }
    });
    return () => {
      live = false;
    };
  }, [next]);

  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  const put = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      setDigits((d) => d.map((x, i) => (i === index ? "" : x)));
      return;
    }
    setDigits((d) => {
      const out = [...d];
      for (let i = 0; i < clean.length && index + i < LENGTH; i++) out[index + i] = clean[i];
      return out;
    });
    boxes.current[Math.min(index + clean.length, LENGTH - 1)]?.focus();
  };

  const onKey = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) boxes.current[index - 1]?.focus();
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    put(0, e.clipboardData.getData("text"));
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const state = await verifyOnboardingPin(digits.join(""));
    setBusy(false);
    if (state.status === "verified" || state.status === "none") next();
    else if (state.status === "error") setError(state.error);
  };

  const resend = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const state = await resendOnboardingPin();
    setBusy(false);
    if (state.status === "verified" || state.status === "none") next();
    else if (state.status === "sent") {
      setDigits(Array(LENGTH).fill(""));
      setNotice(tx("New code sent. Check your inbox."));
      setWait(state.resendAfter);
      boxes.current[0]?.focus();
    } else if (state.status === "error") setError(state.error);
  };

  if (!ready) return null;
  const full = digits.every(Boolean);
  const mmss = `${Math.floor(wait / 60)}:${String(wait % 60).padStart(2, "0")}`;

  return (
    <HubTheme className="hub-card p-6 space-y-5 text-left">
      <div className="text-center space-y-2">
        <h2 className="text-3xl">{tx("Check your email")}</h2>
        <p className="hub-muted">
          {tx("We sent a 6-digit code to")} {email}. {tx("Your workspace is being set up while you verify.")}
        </p>
      </div>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (full && !busy) verify();
        }}
      >
        <label className="hub-label block" htmlFor="hub-pin-0">
          {tx("Verification code")}
        </label>
        <div className={`hub-pin${error ? " is-error" : ""}`}>
          {digits.map((d, i) => (
            <input
              key={i}
              id={`hub-pin-${i}`}
              ref={(el) => {
                boxes.current[i] = el;
              }}
              value={d}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              aria-label={`${tx("Digit")} ${i + 1}`}
              maxLength={LENGTH}
              onChange={(e) => put(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              onPaste={onPaste}
              autoFocus={i === 0}
            />
          ))}
        </div>
        <p className={`text-sm min-h-5 ${error ? "hub-error" : "hub-muted"}`} role={error ? "alert" : undefined}>
          {(error && tx(error)) || notice || tx("The code works for 15 minutes.")}
        </p>
        <button type="submit" className="hub-btn w-full" disabled={busy || !full}>
          {tx("Verify email")}
        </button>
        <button type="button" className="hub-btn hub-btn-quiet w-full" onClick={resend} disabled={busy || wait > 0}>
          {wait > 0 ? `${tx("Send again in")} ${mmss}` : tx("Send a new code")}
        </button>
      </form>
    </HubTheme>
  );
}
