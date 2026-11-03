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

// The Sticks landing at `/` (agent_sdk 1.25.0, app_type sticks): the
// concept Ray approved ("this is the best design"), section for section and
// in its colours - black and white as the base with the concept's
// highlights on top (sticks-landing.css). Header, the crowd hero with the
// orange ring round the one who looks up, the house rule, Meet your Sticks
// with the Hire a Stick screen and the New hire card in one row, the live
// feed, the ask you can try, Between Sticks, the app gallery, how it works,
// the closing call to action and the footer credit.
//
// Server component: the release and the tour listing are read here
// (sticks-sources.server.ts, cached for an hour) and handed down; the
// header, the feed ticker and the ask are the client islands in
// sticks-landing.client.tsx. Every word is sticks-landing-config.ts's,
// the drawings and the crowd picture sticks-art.tsx's, the tokens sticks-landing.css's (scoped
// to .stx), the faces sticks-fonts.ts's. Icons are Remixicon. The
// footer's line is base_sdk's SiteCredit: "© 2026 Sticks · Built with ♥
// by ROKCT", the heart read as "love". No wordmark closes the page and no
// client showcase is drawn.

import "./sticks-landing.css";

import {
  RiAndroidFill,
  RiAndroidLine,
  RiApps2Line,
  RiArrowLeftRightLine,
  RiCheckboxCircleFill,
  RiDownloadCloud2Line,
  RiGithubLine,
  RiLock2Line,
  RiHandHeartLine,
  RiInboxArchiveLine,
  RiInformationLine,
  RiKey2Line,
  RiLoader4Line,
  RiPhoneLine,
  RiPulseLine,
  RiQuestionAnswerLine,
  RiRouteLine,
  RiShieldCheckLine,
  RiSmartphoneLine,
  RiSpyLine,
  RiTeamLine,
  RiUserAddLine,
  RiUserForbidLine,
  RiWindowsFill,
  RiChat3Line,
} from "@remixicon/react";
import type { ReactNode } from "react";

import { SiteCredit } from "@/components/custom/site-credit";

import { CrowdPicture, StickHead } from "./sticks-art";
import {
  STICKS_ASK,
  STICKS_BETWEEN,
  STICKS_DOWNLOAD,
  STICKS_FEED,
  STICKS_FINAL,
  STICKS_FOOTER,
  STICKS_GALLERY,
  STICKS_HERO,
  STICKS_HOW,
  STICKS_MEET,
  STICKS_RULES,
  STICKS_SITE_NAME,
  fill,
} from "./sticks-landing-config";
import { SticksAsk, SticksFeed, SticksHeader } from "./sticks-landing.client";
import { tourScreen, type Downloads, type TourScreen } from "./sticks-sources";
import { loadDownloads, loadTourScreens } from "./sticks-sources.server";

function I({ children }: { children: ReactNode }) {
  return <i aria-hidden="true">{children}</i>;
}

function Marked({ before, mark, after }: { before: string; mark: string; after: string }) {
  return (
    <>
      {before}
      <span className="mk">{mark}</span>
      {after}
    </>
  );
}

function Phone({ shot, alt, eager }: { shot: TourScreen; alt: string; eager?: boolean }) {
  // Plain <img>s: the screens are the app's tour captures on GitHub, so they
  // follow every merge of the app without a rebuild of this site. The light
  // and the dark capture are both in the markup and the theme class picks
  // one (.shot-l / .shot-d in the CSS); a step with no dark capture yet
  // shows its light one in both themes. `eager` is for the gallery, whose
  // row scrolls sideways where a lazy image may never be asked for.
  const loading = eager ? "eager" : "lazy";
  return (
    <div className="phone">
      {shot.light ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={shot.dark ? "l" : undefined}
          src={shot.light}
          alt={alt}
          width={1080}
          height={1920}
          loading={loading}
          decoding="async"
        />
      ) : null}
      {shot.dark ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="d" src={shot.dark} alt={alt} width={1080} height={1920} loading={loading} decoding="async" />
      ) : null}
    </div>
  );
}

const REAL_ICONS = { phone: RiSmartphoneLine, call: RiPhoneLine, lock: RiLock2Line } as const;

function Real({ children, icon = "phone" }: { children: ReactNode; icon?: keyof typeof REAL_ICONS }) {
  const Icon = REAL_ICONS[icon];
  return (
    <div className="real">
      <I>
        <Icon />
      </I>
      {children}
    </div>
  );
}

const RULE_ICONS = { "user-forbid": RiUserForbidLine, key: RiKey2Line, "hand-heart": RiHandHeartLine } as const;
const LINE_ICONS = { swap: RiArrowLeftRightLine, inbox: RiInboxArchiveLine, spy: RiSpyLine } as const;
const STEP_ICONS = { download: RiDownloadCloud2Line, "user-add": RiUserAddLine, answer: RiQuestionAnswerLine } as const;

function downloadHref(downloads: Downloads, link: Downloads["android"]): string | null {
  return link ? link.url : downloads.state === "unknown" ? downloads.releaseUrl : null;
}

function DownloadRow({ downloads }: { downloads: Downloads }) {
  const soon = downloads.state === "none";
  const platforms = [
    { key: "android", label: STICKS_DOWNLOAD.android, icon: <RiAndroidFill />, href: downloadHref(downloads, downloads.android), primary: true },
    { key: "windows", label: STICKS_DOWNLOAD.windows, icon: <RiWindowsFill />, href: downloadHref(downloads, downloads.windows), primary: false },
  ];
  const note = soon
    ? STICKS_DOWNLOAD.soonNote
    : downloads.version
      ? fill(STICKS_DOWNLOAD.note, { version: downloads.version })
      : STICKS_DOWNLOAD.noteUnknown;
  return (
    <div className="dl">
      <div className="cta-row">
        {platforms.map((p) =>
          p.href ? (
            <a key={p.key} className={p.primary ? "btn btn-dl" : "btn btn-ghost"} href={p.href} rel="noopener" data-download={p.key}>
              <I>{p.icon}</I>
              {p.label}
            </a>
          ) : (
            <span
              key={p.key}
              className={p.primary ? "btn btn-dl is-soon" : "btn btn-ghost is-soon"}
              aria-disabled="true"
              data-download={p.key}
            >
              <I>{p.icon}</I>
              {p.label}
              <small>{STICKS_DOWNLOAD.soon}</small>
            </span>
          ),
        )}
      </div>
      <div className="dl-note">
        <I>
          <RiGithubLine />
        </I>
        <span>{note}</span>
        <span aria-hidden="true">·</span>
        {soon ? (
          <a href={downloads.releaseUrl} rel="noopener">
            {STICKS_DOWNLOAD.watch}
          </a>
        ) : (
          <span>{STICKS_DOWNLOAD.platforms}</span>
        )}
      </div>
    </div>
  );
}

/** The Android button on the last How it works card, as the concept puts it there. */
function AndroidButton({ downloads }: { downloads: Downloads }) {
  const href = downloadHref(downloads, downloads.android);
  return href ? (
    <a className="btn" href={href} rel="noopener" data-download="android">
      <I>
        <RiAndroidFill />
      </I>
      {STICKS_DOWNLOAD.android}
    </a>
  ) : (
    <span className="btn is-soon" aria-disabled="true" data-download="android">
      <I>
        <RiAndroidFill />
      </I>
      {STICKS_DOWNLOAD.android}
      <small>{STICKS_DOWNLOAD.soon}</small>
    </span>
  );
}

export async function SticksLanding({ fontClassName }: { fontClassName: string }) {
  const [downloads, tour] = await Promise.all([loadDownloads(), loadTourScreens()]);
  const screen = (step: string) => tourScreen(step, tour);
  const hire = STICKS_MEET.hire;

  return (
    <div className={`stx ${fontClassName}`}>
      <SticksHeader />

      <main id="top">
        {/* HERO */}
        <section className="hero" aria-labelledby="hero-h">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">
                <I>
                  <RiAndroidLine />
                </I>
                {STICKS_HERO.eyebrow}
              </span>
              <h1 id="hero-h">
                <Marked before={STICKS_HERO.before} mark={STICKS_HERO.mark} after={STICKS_HERO.after} />
              </h1>
              <p className="lede">{STICKS_HERO.lede}</p>
              <DownloadRow downloads={downloads} />
            </div>
            <div className="crowd" role="img" aria-label={STICKS_HERO.crowdLabel}>
              <CrowdPicture eager />
              <span className="you-ring" aria-hidden="true" />
              <span className="you-tag" aria-hidden="true">
                {STICKS_HERO.tag}
              </span>
            </div>
          </div>
        </section>

        {/* THE HOUSE RULE */}
        <section className="rules" aria-labelledby="rules-h">
          <div className="wrap">
            <div className="rules-box">
              <div>
                <span className="eyebrow">
                  <I>
                    <RiShieldCheckLine />
                  </I>
                  {STICKS_RULES.eyebrow}
                </span>
                <h2 id="rules-h">
                  {STICKS_RULES.title[0]}
                  <br />
                  {STICKS_RULES.title[1]}
                </h2>
              </div>
              <div className="rule-list">
                {STICKS_RULES.rules.map((rule) => {
                  const Icon = RULE_ICONS[rule.icon];
                  return (
                    <div className="rule" key={rule.title}>
                      <I>
                        <Icon />
                      </I>
                      <b>{rule.title}</b>
                      <p>{rule.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* MEET YOUR STICKS */}
        <section id="meet" aria-labelledby="meet-h">
          <div className="wrap">
            <div className="sh">
              <div>
                <span className="eyebrow">
                  <I>
                    <RiTeamLine />
                  </I>
                  {STICKS_MEET.eyebrow}
                </span>
                <h2 id="meet-h">
                  <Marked before={STICKS_MEET.before} mark={STICKS_MEET.mark} after={STICKS_MEET.after} />
                </h2>
              </div>
              <p>{STICKS_MEET.body}</p>
            </div>
            <div className="meet-grid">
              <div className="roles">
                {STICKS_MEET.roles.map((r) => (
                  <article className={r.featured ? "role feat" : "role"} key={r.role}>
                    <StickHead stick={r.stick} size={r.featured ? 84 : 64} mood="happy" />
                    <div>
                      {r.featured && <span className="tag">{STICKS_MEET.startHere}</span>}
                      <h3>{r.role}</h3>
                      <p>{r.duty}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="meet-phone">
                <div className="meet-duo">
                  <Phone shot={screen(STICKS_MEET.screen.step)} alt={STICKS_MEET.screen.alt} />
                  <div className="hire" aria-label={hire.label}>
                    <div className="board-top">
                      <b>{hire.title}</b>
                      <span className="live">{hire.status}</span>
                    </div>
                    <div className="hire-who">
                      <StickHead stick="sipho" size={54} />
                      <div>
                        <b>{hire.name}</b>
                        <span>{hire.role}</span>
                      </div>
                    </div>
                    <dl>
                      {hire.facts.map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                      <div>
                        <dt>{hire.askLabel}</dt>
                        <dd className="ask">
                          <I>
                            <RiHandHeartLine />
                          </I>
                          {hire.ask}
                        </dd>
                      </div>
                    </dl>
                    <ol>
                      {hire.steps.map((step) => (
                        <li key={step.text} className={step.done ? undefined : "now"}>
                          <I>{step.done ? <RiCheckboxCircleFill /> : <RiLoader4Line />}</I>
                          {step.text}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
                <Real>{STICKS_MEET.real}</Real>
              </div>
            </div>
          </div>
        </section>

        {/* THE LIVE FEED */}
        <section id="feed" className="feed-sec" aria-labelledby="feed-h">
          <div className="wrap feed-grid">
            <div className="feed-copy">
              <span className="eyebrow">
                <I>
                  <RiPulseLine />
                </I>
                {STICKS_FEED.eyebrow}
              </span>
              <h2 id="feed-h">
                <Marked before={STICKS_FEED.before} mark={STICKS_FEED.mark} after={STICKS_FEED.after} />
              </h2>
              {STICKS_FEED.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <ul className="checks">
                {STICKS_FEED.checks.map((c) => (
                  <li key={c}>
                    <I>
                      <RiCheckboxCircleFill />
                    </I>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="board" aria-label={STICKS_FEED.boardLabel}>
              <div className="board-top">
                <b>{STICKS_FEED.board}</b>
                <span className="live">{STICKS_FEED.live}</span>
              </div>
              <div className="shifts">
                {STICKS_FEED.team.map((t) => (
                  <div className={`shift ${t.state}`} key={t.name}>
                    <StickHead stick={t.stick} size={46} mood={t.state === "off" ? "sleep" : "calm"} />
                    {t.name}
                    <span className="st">{t.label}</span>
                  </div>
                ))}
              </div>
              <SticksFeed />
              <div className="demo-note">
                <I>
                  <RiInformationLine />
                </I>
                {STICKS_FEED.note}
              </div>
            </div>
          </div>
        </section>

        {/* ASKS */}
        <section id="asks" aria-labelledby="asks-h">
          <div className="wrap ask-grid">
            <SticksAsk />
            <div className="ask-copy">
              <span className="eyebrow">
                <I>
                  <RiQuestionAnswerLine />
                </I>
                {STICKS_ASK.eyebrow}
              </span>
              <h2 id="asks-h">
                <Marked before={STICKS_ASK.before} mark={STICKS_ASK.mark} after={STICKS_ASK.after} />
              </h2>
              {STICKS_ASK.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <div className="ask-phones">
                {STICKS_ASK.screens.map((s) => (
                  <figure key={s.step}>
                    <Phone shot={screen(s.step)} alt={s.alt} />
                    <Real icon={s.icon}>{s.caption}</Real>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* BETWEEN STICKS */}
        <section className="between" aria-labelledby="bw-h">
          <div className="wrap bw-grid">
            <div>
              <span className="eyebrow">
                <I>
                  <RiChat3Line />
                </I>
                {STICKS_BETWEEN.eyebrow}
              </span>
              <h2 id="bw-h">
                <Marked before={STICKS_BETWEEN.before} mark={STICKS_BETWEEN.mark} after={STICKS_BETWEEN.after} />
              </h2>
              <p>{STICKS_BETWEEN.body}</p>
              <div className="lines">
                {STICKS_BETWEEN.lines.map((line) => {
                  const Icon = LINE_ICONS[line.icon as keyof typeof LINE_ICONS];
                  return (
                    <div className={line.never ? "line never" : "line"} key={line.title}>
                      <I>
                        <Icon />
                      </I>
                      <div>
                        <b>{line.title}</b>
                        <span>{line.body}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bw-phones">
              {STICKS_BETWEEN.screens.map((s) => (
                <figure key={s.step}>
                  <Phone shot={screen(s.step)} alt={s.alt} />
                  <Real>{s.caption}</Real>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className="gallery" aria-labelledby="gal-h">
          <div className="wrap">
            <div className="sh">
              <div>
                <span className="eyebrow">
                  <I>
                    <RiApps2Line />
                  </I>
                  {STICKS_GALLERY.eyebrow}
                </span>
                <h2 id="gal-h">{STICKS_GALLERY.title}</h2>
              </div>
              <p>{STICKS_GALLERY.body}</p>
            </div>
          </div>
          <div className="gal" tabIndex={0} role="region" aria-label={STICKS_GALLERY.label}>
            {STICKS_GALLERY.screens.map((s) => (
              <figure key={s.step}>
                <Phone shot={screen(s.step)} alt={`${s.title}: ${s.body}`} eager />
                <figcaption>
                  <b>{s.title}</b>
                  <span>{s.body}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" aria-labelledby="how-h">
          <div className="wrap">
            <div className="sh">
              <div>
                <span className="eyebrow">
                  <I>
                    <RiRouteLine />
                  </I>
                  {STICKS_HOW.eyebrow}
                </span>
                <h2 id="how-h">{STICKS_HOW.title}</h2>
              </div>
              <p>{STICKS_HOW.body}</p>
            </div>
            <ol className="steps">
              {STICKS_HOW.steps.map((step, i) => {
                const Icon = STEP_ICONS[step.icon as keyof typeof STEP_ICONS];
                const last = i === STICKS_HOW.steps.length - 1;
                return (
                  <li className={last ? "step go" : "step"} key={step.title}>
                    <span className="num" aria-hidden="true">
                      {i + 1}
                    </span>
                    <i className="big" aria-hidden="true">
                      <Icon />
                    </i>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                    {last && <AndroidButton downloads={downloads} />}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* FINAL */}
        <section id="get" className="final" aria-labelledby="final-h">
          <div className="final-art" aria-hidden="true">
            <CrowdPicture />
          </div>
          <div className="wrap">
            <h2 id="final-h">{STICKS_FINAL.title}</h2>
            <p>{STICKS_FINAL.body}</p>
            <DownloadRow downloads={downloads} />
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <SiteCredit as="span" siteName={STICKS_SITE_NAME} year={2026} heartClassName="heart" />
          <nav className="f-links" aria-label={STICKS_SITE_NAME}>
            {STICKS_FOOTER.links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
