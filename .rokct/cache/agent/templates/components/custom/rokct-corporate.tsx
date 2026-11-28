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

// The corporate rokct.ai home (agent_sdk 1.29.0; Ray, 2026-11-21: rokct.ai
// becomes the site of one technology company with divisions that will be
// spun out, its platform, its products, Opportunities for people and an
// investors section). One server section: no "use client", no demos, no
// spinners. Divisions come through the hider (landing/rokct-divisions.ts):
// a division is listed only once its site or repo has announced itself.
// Every word is a trkey (agent.corp_*, English and Afrikaans).
import React from "react";
import Link from "next/link";
import { RiArrowRightLine, RiArrowRightUpLine } from "@remixicon/react";

import t from "@/app/lib/i18n";
import { RK_ROOT_CLASS } from "@/components/custom/landing/rokct-landing-classes";
import { loadDivisions } from "@/components/custom/landing/rokct-divisions.server";
import { STICKS_WEB_URL } from "@/components/custom/landing/corp-links";
import type { PageSectionMeta, PageSectionProps } from "@/components/custom/landing/page-sections";

import "@/components/custom/landing/rokct-landing.css";
import "@/components/custom/landing/rokct-corporate.css";

export const RC_ANCHORS = {
  divisions: "divisions",
  platform: "platform",
  products: "products",
  opportunities: "opportunities",
  investors: "investors",
} as const;

export const meta: PageSectionMeta = {
  order: -1,
  nav: [
    { id: RC_ANCHORS.divisions, label: "Divisions" },
    { id: RC_ANCHORS.platform, label: "Platform" },
    { id: RC_ANCHORS.products, label: "Products" },
    { id: RC_ANCHORS.opportunities, label: "Opportunities" },
    { id: RC_ANCHORS.investors, label: "Investors" },
  ],
  rootClass: RK_ROOT_CLASS,
};

export const RC_PRODUCTS = [
  { name: "TenderAssist", key: "tenders" },
  { name: "Rokct Pay", key: "payments" },
  { name: "Supacharge", key: "education" },
  // Ray 2026-11-22: "Front gate to sticks will be the sticks web not rokct.ai",
  // so the Sticks cell links out to Sticks web.
  { name: "Sticks", key: "agents", href: STICKS_WEB_URL },
] as const;

export const RC_OPPORTUNITY_KINDS = ["grants", "tenders", "equity"] as const;

export const OPPORTUNITIES_HREF = "/opportunities";
export const INVESTORS_HREF = "/about";

function Head({ index, label, title, lede }: { index: string; label: string; title: string; lede?: string }) {
  return (
    <div className="rc-head">
      <div className="rc-kicker">{index} · {label}</div>
      <div>
        <h2 className="rc-h2">{title}</h2>
        {lede ? <p className="rc-lede">{lede}</p> : null}
      </div>
    </div>
  );
}

export default function RokctCorporateSection({ id }: PageSectionProps) {
  const divisions = loadDivisions();
  return (
    <div className="rc" id={id}>
      <section className="rc-wrap rc-hero">
        <div>
          <div className="rc-kicker">{t("agent.corp_kicker")}</div>
          <h1 className="rc-h1">
            {t("agent.corp_h1_a")}
            <br />
            <span className="rc-mute">{t("agent.corp_h1_b")}</span>
          </h1>
        </div>
        <p className="rc-intro">{t("agent.corp_intro")}</p>
      </section>

      <div className="rc-wrap rc-facts">
        <div><span className="rc-kicker">{t("agent.corp_divisions")}</span><b>{divisions.length}</b></div>
        <div><span className="rc-kicker">{t("agent.corp_platform")}</span><b>1</b></div>
        <div><span className="rc-kicker">{t("agent.corp_products")}</span><b>{RC_PRODUCTS.length}</b></div>
        <div><span className="rc-kicker">{t("agent.corp_roots")}</span><b>{t("agent.corp_africa")}</b></div>
      </div>

      <section className="rc-wrap rc-s" id={RC_ANCHORS.divisions}>
        <Head index="01" label={t("agent.corp_divisions")} title={t("agent.corp_divisions_title")} />
        <ol className="rc-rows" data-rc-divisions="">
          {divisions.map((d, i) => {
            const inner = (
              <>
                <span className="rc-n">{d.name}</span>
                <span className="rc-num">{String(i + 1).padStart(2, "0")}</span>
                <span>{t(`agent.corp_div_${d.key}`)}</span>
                <span className="rc-ar" aria-hidden="true">{d.url ? <RiArrowRightUpLine size={18} /> : null}</span>
              </>
            );
            return (
              <li key={d.id} data-division={d.id}>
                {d.url ? <a className="rc-row" href={d.url} target="_blank" rel="noopener">{inner}</a> : <div className="rc-row">{inner}</div>}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="rc-wrap rc-s" id={RC_ANCHORS.platform}>
        <Head index="02" label={t("agent.corp_platform")} title={t("agent.corp_platform_title")} />
        <div className="rc-rows">
          <div className="rc-row">
            <span className="rc-n">Rokct</span>
            <span className="rc-num">01</span>
            <span>{t("agent.corp_platform_rokct")}</span>
            <span className="rc-ar" />
          </div>
        </div>
      </section>

      <section className="rc-wrap rc-s" id={RC_ANCHORS.products}>
        <Head index="03" label={t("agent.corp_products")} title={t("agent.corp_products_title")} />
        <div className="rc-grid">
          {RC_PRODUCTS.map((p) => {
            const body = (
              <>
                <span className="rc-kicker">{t(`agent.corp_prod_${p.key}_kind`)}</span>
                <h3 className="rc-h3">{p.name}</h3>
                <p>{t(`agent.corp_prod_${p.key}`)}</p>
              </>
            );
            return "href" in p ? (
              <a key={p.key} href={p.href} className="rc-cell rc-link" target="_blank" rel="noopener">{body}</a>
            ) : (
              <div key={p.key} className="rc-cell">{body}</div>
            );
          })}
        </div>
      </section>

      <section className="rc-band" id={RC_ANCHORS.opportunities}>
        <div className="rc-wrap rc-s rc-flat">
          <Head index="04" label={t("agent.opportunities")} title={t("agent.corp_opps_title")} lede={t("agent.corp_opps_lede")} />
          <div className="rc-grid">
            {RC_OPPORTUNITY_KINDS.map((k) => (
              <Link key={k} href={`${OPPORTUNITIES_HREF}#${k}`} className="rc-cell rc-link">
                <span className="rc-kicker">{t("agent.corp_open_now")}</span>
                <h3 className="rc-h3">{t(`agent.corp_opps_${k}`)}</h3>
                <p>{t(`agent.corp_opps_${k}_lede`)}</p>
              </Link>
            ))}
            <div className="rc-cell rc-cta">
              <Link href={OPPORTUNITIES_HREF} className="rc-btn">
                {t("agent.corp_opps_all")} <RiArrowRightLine size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="rc-dark" id={RC_ANCHORS.investors}>
        <div className="rc-wrap rc-inv">
          <div>
            <div className="rc-kicker">05 · {t("agent.corp_investors")}</div>
            <h2 className="rc-h2 rc-big">{t("agent.corp_inv_title")}</h2>
            <p className="rc-lede">{t("agent.corp_inv_lede")}</p>
            <Link href={INVESTORS_HREF} className="rc-btn rc-btn-acc">{t("agent.corp_inv_cta")}</Link>
          </div>
          <ul className="rc-facts-list">
            <li>{t("agent.corp_inv_structure")}<span>{t("agent.corp_inv_structure_v")}</span></li>
            <li>{t("agent.corp_inv_holding")}<span>{t("agent.corp_inv_holding_v")}</span></li>
          </ul>
        </div>
      </section>
    </div>
  );
}
