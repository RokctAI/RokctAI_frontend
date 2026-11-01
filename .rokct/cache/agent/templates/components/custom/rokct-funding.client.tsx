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

// The funding band's finder (1.24.0), rendered by rokct-funding.tsx: a real
// search box over the public opportunities registry. A submitted query goes
// to agent-opportunities.tsx - the search panel the old hero drew under its
// input, moved here unchanged with its server action, type filter and
// links to /opportunities - and its panel replaces the four samples while
// it shows results; clearing it brings the samples back.

import React, { useCallback, useState } from "react";
import { RiArrowRightUpLine, RiLoader4Line, RiSearchLine } from "@remixicon/react";

import AgentOpportunitiesSection from "@/components/custom/landing/agent-opportunities";
import { RK_FUNDING } from "@/components/custom/landing/rokct-landing-content";

export function RokctFinder({ signupUrl }: { signupUrl: string }) {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [submitId, setSubmitId] = useState(0);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setSubmitId((n) => n + 1);
  };

  const clear = useCallback(() => {
    setText("");
    setQuery("");
  }, []);

  return (
    <div className="rk-finder rk-reveal">
      <form className="rk-input" role="search" onSubmit={submit}>
        <RiSearchLine className="rk-ico" aria-hidden="true" />
        <label htmlFor="rk-finder-q" className="rk-sr">
          Describe your business to find funding and tenders
        </label>
        <input
          id="rk-finder-q"
          type="search"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (!e.target.value) setQuery("");
          }}
          placeholder={RK_FUNDING.example}
          autoComplete="off"
        />
        <button type="submit" className="rk-send" aria-label="Search">
          {busy ? (
            <RiLoader4Line className="rk-ico animate-spin" aria-hidden="true" />
          ) : (
            <RiArrowRightUpLine className="rk-ico" aria-hidden="true" />
          )}
        </button>
      </form>
      <div className="rk-live">
        <AgentOpportunitiesSection
          query={query}
          submitId={submitId}
          signupUrl={signupUrl}
          onActiveChange={setActive}
          onBusyChange={setBusy}
          onClear={clear}
        />
      </div>
      {!active && (
        <div style={{ marginTop: 8 }}>
          {RK_FUNDING.samples.map((sample) => (
            <div className="rk-res" key={sample.title}>
              <span className={sample.gold ? "rk-k rk-gold" : "rk-k"}>{sample.kind}</span>
              <span>
                <b>{sample.title}</b>
                <small>{sample.sub}</small>
              </span>
              <span className="rk-when">
                {sample.when.map((line, i) => (
                  <React.Fragment key={line}>
                    {i > 0 && <br />}
                    {line}
                  </React.Fragment>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
