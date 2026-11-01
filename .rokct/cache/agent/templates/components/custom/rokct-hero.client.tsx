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

// The moving parts of rokct.ai's hero (1.24.0), rendered by rokct-hero.tsx:
//
//  - RokctHeroWord: the headline's first word, cycling through the copy's
//    words with the concept's blur-and-lift change;
//  - RokctHeroConsole: the sample conversation. The first HTML carries the
//    first exchange already answered, so the console is never empty; after
//    mount it plays the next exchange the way the concept does (the
//    question typed into the box, sent, a working line, the answer card)
//    and loops. A chip plays its own exchange at once and the loop picks
//    up again after a pause. Every exchange is labelled a sample;
//  - RokctMotion: the fade-up of each `.rk-reveal` block as it scrolls
//    into view. It marks the root `rk-js` first, so without scripts every
//    block simply shows.
//
// Under prefers-reduced-motion nothing cycles on its own: the word stays,
// the console keeps the first exchange and a chip swaps the answer in
// without the typing.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { RiLoader4Line, RiSendPlane2Fill } from "@remixicon/react";

import { RK_HERO, RK_SCENARIOS, type RkScenario } from "@/components/custom/landing/rokct-landing-content";
import { RkCardView, RkMark, rkBold } from "@/components/custom/landing/rokct-ui";

import "@/components/custom/landing/rokct-landing.css";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function RokctHeroWord({ words, intervalMs }: { words: readonly string[]; intervalMs: number }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"" | "rk-out" | "rk-in">("");

  useEffect(() => {
    if (words.length < 2 || prefersReducedMotion()) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const interval = setInterval(() => {
      setPhase("rk-out");
      timers.push(
        setTimeout(() => {
          setIndex((i) => (i + 1) % words.length);
          setPhase("rk-in");
          timers.push(setTimeout(() => setPhase(""), 40));
        }, 350),
      );
    }, intervalMs);
    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [words, intervalMs]);

  return (
    <span className="rk-hl rk-rot">
      <span className={phase}>{words[index]}</span>
    </span>
  );
}

/** What the console shows: the visitor's line, a working line, the answer. */
interface Shown {
  key: string;
  me: boolean;
  working: boolean;
  answer: boolean;
}

const SETTLED = (key: string): Shown => ({ key, me: true, working: false, answer: true });

function Answer({ scenario }: { scenario: RkScenario }) {
  return (
    <div className="rk-msg rk-msg-rok">
      <p>{rkBold(scenario.lead)}</p>
      <RkCardView card={scenario.card} />
    </div>
  );
}

export function RokctHeroConsole() {
  const first = RK_SCENARIOS[0];
  const [shown, setShown] = useState<Shown>(SETTLED(first.key));
  const [typed, setTyped] = useState("");
  const token = useRef(0);
  const next = useRef(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wait = (ms: number, tk: number) =>
    new Promise<void>((resolve, reject) => {
      setTimeout(() => (tk === token.current ? resolve() : reject(new Error("superseded"))), ms);
    });

  const play = useCallback(async (scenario: RkScenario): Promise<boolean> => {
    const tk = ++token.current;
    if (prefersReducedMotion()) {
      setTyped("");
      setShown(SETTLED(scenario.key));
      return true;
    }
    try {
      setShown({ key: scenario.key, me: false, working: false, answer: false });
      setTyped("");
      for (let i = 1; i <= scenario.question.length; i++) {
        await wait(32, tk);
        setTyped(scenario.question.slice(0, i));
      }
      await wait(300, tk);
      setTyped("");
      setShown({ key: scenario.key, me: true, working: false, answer: false });
      await wait(350, tk);
      setShown({ key: scenario.key, me: true, working: true, answer: false });
      await wait(1100, tk);
      setShown(SETTLED(scenario.key));
      return true;
    } catch {
      return false;
    }
  }, []);

  const schedule = useCallback(
    (ms: number) => {
      if (timer.current) clearTimeout(timer.current);
      if (prefersReducedMotion()) return;
      timer.current = setTimeout(async () => {
        const scenario = RK_SCENARIOS[next.current % RK_SCENARIOS.length];
        next.current += 1;
        if (await play(scenario)) schedule(5200);
      }, ms);
    },
    [play],
  );

  useEffect(() => {
    schedule(5200);
    return () => {
      token.current += 1;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [schedule]);

  const choose = async (index: number) => {
    if (timer.current) clearTimeout(timer.current);
    next.current = index + 1;
    if (await play(RK_SCENARIOS[index])) schedule(9000);
  };

  const scenario = RK_SCENARIOS.find((s) => s.key === shown.key) ?? first;

  return (
    <div className="rk-console" aria-label="Sample conversation with ROK">
      <div className="rk-c-head">
        <div className="rk-c-av">
          <RkMark className="rk-mark" />
        </div>
        <div>
          <div className="rk-c-title">{RK_HERO.console.title}</div>
          <div className="rk-c-sub">{RK_HERO.console.sub}</div>
        </div>
        <span className="rk-c-tag">{RK_HERO.console.tag}</span>
      </div>
      <div className="rk-c-body" aria-live="polite">
        {shown.me && <div className="rk-msg rk-msg-me">{scenario.question}</div>}
        {shown.working && (
          <div className="rk-msg rk-msg-rok">
            <span className="rk-work">
              <RiLoader4Line className="rk-ico" aria-hidden="true" />
              {scenario.working}
            </span>
          </div>
        )}
        {shown.answer && <Answer scenario={scenario} />}
      </div>
      <div className="rk-c-foot">
        <div className="rk-chips">
          {RK_SCENARIOS.map((s, i) => (
            <button
              key={s.key}
              type="button"
              className={s.key === shown.key ? "rk-chip rk-on" : "rk-chip"}
              aria-pressed={s.key === shown.key}
              onClick={() => choose(i)}
            >
              {s.chip}
            </button>
          ))}
        </div>
        <div className="rk-input" aria-hidden="true">
          <span className="rk-t" data-placeholder={RK_HERO.console.placeholder}>
            {typed}
          </span>
          <span className="rk-send">
            <RiSendPlane2Fill className="rk-ico" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function RokctMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const blocks = Array.from(document.querySelectorAll<HTMLElement>(".rk-reveal"));
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      blocks.forEach((el) => el.classList.add("rk-vis"));
      return;
    }
    root.classList.add("rk-js");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("rk-vis");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    blocks.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      root.classList.remove("rk-js");
    };
  }, []);
  return null;
}
