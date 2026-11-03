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

// The end of rokct.ai's landing (1.24.0): "Your company, at your own
// address." (the `site` anchor the footer links to), "Wherever you
// already are.", the questions and the closing "Ask ROK anything." box.
// The box is a real input: sending it opens the chat for a signed-in
// visitor, and sign-up for a visitor with no session. Server-safe entry; the box is rokct-closing.client.tsx.
// No header stop of its own.

import React from "react";
import { RiAddLine } from "@remixicon/react";

import { RokctAskBox } from "@/components/custom/rokct-closing.client";
import {
  RK_ANCHORS,
  RK_FAQ,
  RK_FINAL,
  RK_SITE,
  RK_WHERE,
} from "@/components/custom/landing/rokct-landing-content";
import { RkAsk, RkIcon, RkPill, rkLines } from "@/components/custom/landing/rokct-ui";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

export const meta: PageSectionMeta = {
  order: 50,
  nav: [],
  anchor: RK_ANCHORS.site,
};

export default function RokctClosingSection({ id, session, signupUrl }: PageSectionProps) {
  const signedIn = Boolean((session as { user?: unknown } | null | undefined)?.user);
  return (
    <>
      <section className="rk-s rk-flush" id={id}>
        <div className="rk-wrap rk-addr">
          <div className="rk-reveal">
            <RkAsk>{RK_SITE.ask}</RkAsk>
            <h2 className="rk-h2">{rkLines(RK_SITE.heading)}</h2>
            <p className="rk-lede">{RK_SITE.lede}</p>
            <ul className="rk-addr-list">
              {RK_SITE.points.map((point) => (
                <li key={point.title}>
                  <RkIcon name={point.icon} />
                  <span>
                    <b>{point.title}</b>
                    {point.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rk-browser rk-reveal" aria-label="Sample: connecting your own domain">
            <div className="rk-b-bar">
              <span className="rk-b-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="rk-b-url">
                <RkIcon name="lock" />
                <b>{RK_SITE.browser.url}</b>
              </span>
            </div>
            <div className="rk-b-body">
              {RK_SITE.browser.domains.map((dom) => (
                <div className="rk-dom" key={dom.name}>
                  <span className="rk-di">
                    <RkIcon name={dom.icon} />
                  </span>
                  <span>
                    <b>{dom.name}</b>
                    <small>{dom.sub}</small>
                  </span>
                  <RkPill tone={dom.pill.tone}>{dom.pill.text}</RkPill>
                </div>
              ))}
              <div className="rk-track">
                {RK_SITE.browser.track.map((step) => (
                  <span key={step.text} className={step.state ? `rk-${step.state}` : undefined}>
                    {step.text}
                  </span>
                ))}
              </div>
              <div className="rk-msg rk-msg-rok">{RK_SITE.browser.note}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="rk-s rk-flush">
        <div className="rk-wrap">
          <RkAsk className="rk-reveal">{RK_WHERE.ask}</RkAsk>
          <div className="rk-s-head rk-reveal">
            <h2 className="rk-h2">{rkLines(RK_WHERE.heading)}</h2>
            <p className="rk-lede">{RK_WHERE.lede}</p>
          </div>
          <div className="rk-where rk-reveal">
            {RK_WHERE.doors.map((door) => (
              <div className={door.live ? "rk-w" : "rk-w rk-is-soon"} key={door.name}>
                <div className="rk-w-top">
                  <span className="rk-wi">
                    <RkIcon name={door.icon} />
                  </span>
                  <span className={door.live ? "rk-live-pill" : "rk-soon"}>
                    {door.live ? RK_WHERE.available : RK_WHERE.soon}
                  </span>
                </div>
                <h3 className="rk-h3">{door.name}</h3>
                <p>{door.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rk-s rk-flush">
        <div className="rk-wrap rk-faq">
          <div className="rk-reveal">
            <RkAsk>{RK_FAQ.ask}</RkAsk>
            <h2 className="rk-h2">{rkLines(RK_FAQ.heading)}</h2>
          </div>
          <div className="rk-reveal">
            {RK_FAQ.items.map((item, i) => (
              <details key={item.q} open={i === 0}>
                <summary>
                  {item.q}
                  <RiAddLine className="rk-ico" aria-hidden="true" />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="rk-final">
        <div className="rk-wrap rk-reveal">
          <div className="rk-eyebrow">
            <span className="rk-dot" />
            {RK_FINAL.eyebrow}
          </div>
          <h2 className="rk-h2">
            {RK_FINAL.heading[0]}
            <br />
            <span className="rk-hl">{RK_FINAL.heading[1]}</span>
          </h2>
          <RokctAskBox target={signedIn ? "/chat" : signupUrl} />
          <p className="rk-note">{RK_FINAL.note}</p>
        </div>
      </section>
    </>
  );
}
