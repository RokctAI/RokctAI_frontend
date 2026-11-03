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

// The Sticks landing's client islands (agent_sdk 1.25.0): the header (its
// rule once the page scrolls, the light/dark switch through the shell's
// next-themes provider), the live feed (a new line every few seconds) and
// the ask you can answer. Every word is sticks-landing-config.ts's.
//
// Motion respects prefers-reduced-motion: the feed stands still on the
// lines it starts with, and the CSS drops every animation and transition.
// The header logo links to "/". No Log in or Sign up: Sticks has nothing
// to sign in to on the web, and this shell composes no auth_sdk.

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

import {
  RiArrowLeftRightLine,
  RiArrowRightLine,
  RiCheckboxCircleFill,
  RiCloseLine,
  RiContrast2Line,
  RiDownload2Line,
  RiEdit2Fill,
  RiEditLine,
  RiFilePdf2Line,
  RiForbid2Fill,
  RiLockLine,
  RiMailLine,
  RiQuestionLine,
  RiSendPlaneFill,
  RiTimeLine,
  RiUser3Fill,
} from "@remixicon/react";

import { SticksMark, StickHead } from "./sticks-art";
import {
  FEED_START_MINUTES,
  STICKS_ASK,
  STICKS_FEED,
  STICKS_HEADER,
  STICKS_NAV,
  STICKS_SITE_NAME,
  feedTime,
} from "./sticks-landing-config";

export function SticksHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={scrolled ? "top scrolled" : "top"}>
      <div className="wrap bar">
        <a className="brand" href="/" aria-label={STICKS_HEADER.home}>
          <SticksMark className="brand-mark" />
          {STICKS_SITE_NAME}
        </a>
        <nav className="nav-links" aria-label={STICKS_HEADER.sections}>
          {STICKS_NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="bar-end">
          <button
            type="button"
            className="icon-btn"
            aria-label={STICKS_HEADER.theme}
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <i aria-hidden="true">
              <RiContrast2Line />
            </i>
          </button>
          <a className="btn btn-dl btn-sm" href="#get">
            <i aria-hidden="true">
              <RiDownload2Line />
            </i>
            <span>{STICKS_HEADER.getApp}</span>
          </a>
        </div>
      </div>
    </header>
  );
}

const PILL_ICONS = { ask: RiQuestionLine, msg: RiMailLine, hand: RiArrowLeftRightLine } as const;
const FIRST_LINES = 6;
const MAX_LINES = 7;

interface FeedLine {
  key: number;
  event: number;
  minutes: number;
}

function firstLines(): FeedLine[] {
  return Array.from({ length: FIRST_LINES }, (_, j) => ({
    key: j,
    event: j,
    minutes: FEED_START_MINUTES + j * 4,
  })).reverse();
}

export function SticksFeed() {
  const [lines, setLines] = useState<FeedLine[]>(firstLines);
  const next = useRef({ key: FIRST_LINES, event: FIRST_LINES, minutes: FEED_START_MINUTES + 23 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      const n = next.current;
      const line = { key: n.key, event: n.event % STICKS_FEED.events.length, minutes: n.minutes };
      next.current = { key: n.key + 1, event: n.event + 1, minutes: n.minutes + 2 + (n.event % 3) };
      setLines((current) => [line, ...current].slice(0, MAX_LINES));
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <ul className="feed" aria-live="off">
      {lines.map((line) => {
        const e = STICKS_FEED.events[line.event];
        const Pill = e.pill ? PILL_ICONS[e.pill] : null;
        return (
          <li key={line.key}>
            <StickHead stick={e.stick} size={40} />
            <div>
              <div className="who">
                {e.name}
                <span>{e.role}</span>
              </div>
              <div className="what">{e.what}</div>
              {e.pill && Pill && (
                <span className={`pill ${e.pill}`}>
                  <i aria-hidden="true">
                    <Pill />
                  </i>
                  {STICKS_FEED.pills[e.pill]}
                </span>
              )}
            </div>
            <time>{feedTime(line.minutes)}</time>
          </li>
        );
      })}
    </ul>
  );
}

type Answer = "ok" | "ed" | "no";

const OUTCOME_ICONS = { ok: RiCheckboxCircleFill, ed: RiEdit2Fill, no: RiForbid2Fill } as const;

export function SticksAsk() {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const card = STICKS_ASK.card;
  const Outcome = answer ? OUTCOME_ICONS[answer] : null;
  return (
    <div className="askcard">
      <span className="try">{card.tryIt}</span>
      <div className="ask-head">
        <div>
          <span className="chip">
            <i aria-hidden="true">
              <RiMailLine />
            </i>
            {card.chip}
          </span>
          <h3>{card.title}</h3>
          <div className="due">
            <i aria-hidden="true">
              <RiTimeLine />
            </i>
            {card.due}
          </div>
        </div>
        <StickHead stick="tumi" size={72} />
      </div>
      <div className="chain" aria-label={card.chainLabel}>
        {card.chain.map((c) => (
          <span className="n-wrap" key={c.name}>
            <span className="n">
              <StickHead stick={c.stick} size={38} />
              {c.name}
              <small>{c.did}</small>
            </span>
            <i className="to" aria-hidden="true">
              <RiArrowRightLine />
            </i>
          </span>
        ))}
        <span className="n">
          <span className="you">
            <i aria-hidden="true">
              <RiUser3Fill />
            </i>
          </span>
          {card.you.name}
          <small>{card.you.did}</small>
        </span>
      </div>
      <p className="ask-why">{card.why}</p>
      <div className="mail">
        <div className="row">
          <span>{card.to[0]}</span>
          <b>{card.to[1]}</b>
        </div>
        <div className="row">
          <span>{card.subject[0]}</span>
          <b>{card.subject[1]}</b>
        </div>
        <div className="body">
          {card.body}
          <br />
          <span className="attach">
            <i aria-hidden="true">
              <RiFilePdf2Line />
            </i>
            {card.attachment}
          </span>
        </div>
      </div>
      <div className="guard">
        <i aria-hidden="true">
          <RiLockLine />
        </i>
        {card.guard}
      </div>
      {answer === null ? (
        <div className="ask-btns">
          <button type="button" className="yes" onClick={() => setAnswer("ok")}>
            <i aria-hidden="true">
              <RiSendPlaneFill />
            </i>
            {card.send}
          </button>
          <button type="button" onClick={() => setAnswer("ed")}>
            <i aria-hidden="true">
              <RiEditLine />
            </i>
            {card.edit}
          </button>
          <button type="button" onClick={() => setAnswer("no")}>
            <i aria-hidden="true">
              <RiCloseLine />
            </i>
            {card.no}
          </button>
        </div>
      ) : null}
      <div className={answer ? `outcome ${answer}` : "outcome"} role="status">
        {answer && Outcome ? (
          <>
            <i aria-hidden="true">
              <Outcome />
            </i>
            <span>{card.outcomes[answer]}</span>
          </>
        ) : null}
      </div>
      {answer !== null && (
        <button type="button" className="reset" onClick={() => setAnswer(null)}>
          {card.again}
        </button>
      )}
    </div>
  );
}
