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

// The hub's feature switches screen (Ray 2026-11-22, layout approved on the
// render; "This theme": the hub's Sticks theme). Turn a tenant feature off
// per plan, or override it for one tenant; each tenant picks the change up
// on its next subscription check. Drawn in the hub theme, which lives in one
// place: agent_sdk components/custom/hub/hub-theme.css (HubTheme).
// Server half: app/actions/handson/control/feature-switches/feature-switches.ts.
// Sidebar entry: the shell's app/handson/layout.tsx controlItems.

import { useCallback, useEffect, useMemo, useState } from "react";

import { HubTheme } from "@/components/custom/hub/hub-theme";
import { tx } from "@/app/lib/i18n/phrases";
import {
  getFeatureSwitches,
  setPlanFeature,
  setTenantFeature,
} from "@/app/actions/handson/control/feature-switches/feature-switches";
import type {
  FeatureKey,
  FeatureSwitches,
  OverrideValue,
} from "@/app/services/control/feature-switches";

const LABELS: Record<FeatureKey, { title: string; hint: string }> = {
  plugin_building: { title: "Plugin building", hint: "Sticks can draft new plugins" },
  unsupported_service_plugins: { title: "Plugins for unsupported services", hint: "Plugins for services we don't ship" },
  voice_calls: { title: "Voice calls", hint: "Sticks call CRM contacts and answer calls" },
  hands_on: { title: "Hands-on view", hint: "People work on their own when AI is off" },
};

type Tab = "plans" | "tenants";

function Switch({ on, label, disabled, onChange }: { on: boolean; label: string; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className="hub-switch"
      disabled={disabled}
      onClick={() => onChange(!on)}
    />
  );
}

export default function FeatureSwitchesPage() {
  const [data, setData] = useState<FeatureSwitches | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("plans");
  const [tenant, setTenant] = useState("");

  const load = useCallback(async () => {
    const out = await getFeatureSwitches();
    setData(out.data);
    setError(out.error ?? null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const features = (data?.features?.length ? data.features : Object.keys(LABELS)) as FeatureKey[];
  const planOf = useMemo(() => new Map((data?.plans ?? []).map((p) => [p.name, p])), [data]);

  const savePlan = async (plan: string, key: FeatureKey, on: boolean) => {
    setSaving(`${plan}:${key}`);
    const out = await setPlanFeature(plan, key, on);
    setSaving(null);
    if (!out.success) setError(out.error ?? null);
    await load();
  };

  const saveTenant = async (sub: string, key: FeatureKey, value: OverrideValue) => {
    setSaving(`${sub}:${key}`);
    const out = await setTenantFeature(sub, key, value);
    setSaving(null);
    if (!out.success) setError(out.error ?? null);
    await load();
  };

  const picked = data?.tenants.find((t) => t.name === tenant);
  const pickedOverrides = data?.overrides.find((o) => o.name === tenant)?.overrides ?? {};

  return (
    <HubTheme className="min-h-full p-6 md:p-10 space-y-6">
      <header className="space-y-2">
        <div className="hub-kicker">{tx("Hub")} · Sticks</div>
        <h1 className="text-3xl md:text-4xl">{tx("Feature switches")}</h1>
        <p className="hub-muted">
          {tx("Reaches each tenant on its next subscription check. A tenant that can't reach the hub keeps its last switches.")}
        </p>
      </header>

      <div className="hub-tabs" role="tablist">
        <button type="button" role="tab" className="hub-tab" aria-selected={tab === "plans"} onClick={() => setTab("plans")}>
          {tx("By plan")}
        </button>
        <button type="button" role="tab" className="hub-tab" aria-selected={tab === "tenants"} onClick={() => setTab("tenants")}>
          {tx("Tenant overrides")}
        </button>
      </div>

      {error && <p className="hub-error" role="alert">{tx(error)}</p>}
      {!data ? null : tab === "plans" ? (
        <section data-tour="feature-switches-plans" className="space-y-2 overflow-x-auto">
          <div className="grid items-center gap-2 px-4 hub-muted font-semibold" style={{ gridTemplateColumns: `minmax(220px,1fr) repeat(${data.plans.length}, 110px)` }}>
            <span>{tx("Feature")}</span>
            {data.plans.map((p) => (
              <span key={p.name}>{p.plan_name}</span>
            ))}
          </div>
          {features.map((key) => (
            <div key={key} className="hub-card grid items-center gap-2 p-4" style={{ gridTemplateColumns: `minmax(220px,1fr) repeat(${data.plans.length}, 110px)` }}>
              <span>
                <b style={{ fontFamily: "var(--display)" }}>{tx(LABELS[key].title)}</b>
                <small className="block hub-muted">{tx(LABELS[key].hint)}</small>
              </span>
              {data.plans.map((p) => (
                <Switch
                  key={p.name}
                  on={p.features[key]}
                  label={`${tx(LABELS[key].title)}, ${p.plan_name}`}
                  disabled={saving !== null}
                  onChange={(v) => savePlan(p.name, key, v)}
                />
              ))}
            </div>
          ))}
          {data.plans.length === 0 && <p className="hub-muted">{tx("No plans yet.")}</p>}
        </section>
      ) : (
        <section data-tour="feature-switches-tenants" className="space-y-4">
          <div className="hub-card p-4 space-y-3">
            <label className="hub-label block" htmlFor="fs-tenant">{tx("Tenant")}</label>
            <select id="fs-tenant" className="hub-input" value={tenant} onChange={(e) => setTenant(e.target.value)}>
              <option value="">{tx("Pick a tenant")}</option>
              {data.tenants.map((t) => (
                <option key={t.name} value={t.name}>
                  {(t.site_name || t.name) + (t.plan ? ` · ${t.plan}` : "")}
                </option>
              ))}
            </select>
            {picked &&
              features.map((key) => {
                const planOn = planOf.get(picked.plan ?? "")?.features[key] ?? true;
                const value = (pickedOverrides[key] ?? "") as OverrideValue;
                return (
                  <div key={key} className="flex flex-wrap items-center justify-between gap-3 border-t pt-3" style={{ borderColor: "var(--line)" }}>
                    <span>
                      <b style={{ fontFamily: "var(--display)" }}>{tx(LABELS[key].title)}</b>
                      <small className="block hub-muted">
                        {tx("Plan")}: {planOn ? tx("On") : tx("Off")}
                      </small>
                    </span>
                    <div className="hub-tabs" role="radiogroup" aria-label={tx(LABELS[key].title)}>
                      {(["", "On", "Off"] as OverrideValue[]).map((v) => (
                        <button
                          key={v || "plan"}
                          type="button"
                          role="radio"
                          className="hub-tab"
                          aria-selected={value === v}
                          aria-checked={value === v}
                          disabled={saving !== null}
                          onClick={() => saveTenant(picked.name, key, v)}
                        >
                          {v ? tx(v) : tx("Follow plan")}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {data && (
        <section className="hub-card p-5" data-tour="feature-switches-overrides">
          <h2 className="text-lg">
            {tx("Tenant overrides")} · {data.overrides.length}
          </h2>
          {data.overrides.length === 0 && <p className="hub-muted pt-2">{tx("Every tenant follows its plan.")}</p>}
          {data.overrides.map((o) =>
            (Object.entries(o.overrides) as [FeatureKey, "On" | "Off"][]).map(([key, v]) => {
              const planOn = planOf.get(o.plan ?? "")?.features[key] ?? true;
              return (
                <div key={`${o.name}:${key}`} className="flex flex-wrap justify-between gap-2 border-t py-3" style={{ borderColor: "var(--line)" }}>
                  <span>
                    {o.site_name || o.name} <span className="hub-muted">· {o.plan}</span>
                  </span>
                  <span>
                    {tx(LABELS[key].title)} <b className={v === "On" ? "hub-ok" : "hub-error"}>{tx(v)}</b>{" "}
                    <span className="hub-muted">({tx("plan")}: {planOn ? tx("On") : tx("Off")})</span>
                  </span>
                </div>
              );
            }),
          )}
        </section>
      )}
    </HubTheme>
  );
}
