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
// The host shell's middleware, installed by auth_sdk (NextAuth-gated).
// Register registry (auth_sdk 1.7.0): what a HOME SDK injects to make the
// register page ITS register page.
//
// Ray, 2026-09-09: "register is not fitting for all, what rokct need is not
// what all needs, any home sdk need to inject what it needs, just like dart
// auth sdk has". The Dart auth SDK owns the register FLOW and nothing
// product-specific: the app's home SDK flips AuthRegistrationConfig flags
// through a manifest integration aimed at the installed shell's
// `// @auth-registration-config` placeholder, contributes post-account
// steps through its manifest "registration_steps" list (RegistrationStep:
// visible, skippable, content), and extends completion at
// `// @registration-complete-hook`. This file is the Next.js twin of that,
// in the one-marker registry shape base_sdk's hero-copy.ts and header-menu.ts
// (and this SDK's app/(auth)/tenant-link.ts) established:
//
//   { id: "<sdk>-register", load: () => import("@/components/custom/auth/<file>") },
//
// injected as ONE line at the marker below by the installer
// (sdk_installer_base.py update_integrations(), single-answer: the home
// SDK's entry lands, any other SDK's is skipped with [~]). The module's
// default export is a RegisterConfig: whether register is offered at all,
// the copy (title, subtitle, CTA), the extra FIELDS the account form asks
// after its own name / email / password, and the post-account STEPS. The
// provisioning action - what happens to the submission on the server - is
// the other half of the contract and lives in app/(auth)/register-provision.ts,
// a second one-marker registry, because a server module must never be
// reachable from this client-safe file.
//
// With NOTHING registered [loadRegisterConfig] answers DEFAULT_REGISTER_CONFIG:
// register offered, the generic account fields only, the platform's copy.
// That is auth_sdk's own register page - exactly what the Dart flow shows
// an app whose home SDK declares nothing.
//
// This module imports nothing but types, so it is safe in a client
// component, in a server component and under a plain node test.

import type { ComponentType } from "react";

/** The words on the register page. Every one optional; the defaults are the platform's. */
export interface RegisterCopy {
  /** The heading. */
  title?: string;
  /** One line under the heading. */
  subtitle?: string;
  /** The submit button. */
  cta?: string;
  /** The line before the sign-in link ("Already have an account?"). */
  signInPrompt?: string;
  /** The sign-in link's label. */
  signInLabel?: string;
}

export interface RegisterFieldOption {
  value: string;
  label: string;
}

/**
 * One extra field the account form asks, after its own name, email and
 * password. Rendered by components/custom/auth-form.tsx in declaration
 * order; its value reaches the provisioner under `values[name]`.
 */
export interface RegisterField {
  /** The form field name; unique in the config. */
  name: string;
  label: string;
  /** `text` by default. A `select` needs `options` or `loadOptions`; a `hidden` field renders no control. */
  type?:
    | "text"
    | "email"
    | "password"
    | "tel"
    | "url"
    | "number"
    | "select"
    | "checkbox"
    | "hidden";
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  /** Prefill from this query parameter of the register URL when present (e.g. a plan chosen on the landing page). */
  fromQuery?: string;
  autoComplete?: string;
  /** One line under the control. */
  hint?: string;
  /** The choices of a `select`, when known up front. */
  options?: RegisterFieldOption[];
  /** The choices of a `select`, fetched after mount (a catalogue the home SDK reads from its backend). */
  loadOptions?: () => Promise<RegisterFieldOption[]>;
  /** How many of the form's two columns the control spans; 1 by default. */
  span?: 1 | 2;
}

/** What a post-account step's component receives. */
export interface RegisterStepProps {
  /** Advance to the next step (or finish). */
  next: () => void;
  /** Leave this step out and advance; only offered when the step is skippable. */
  skip: () => void;
  /** The email the account was created with. */
  email: string;
  /** The tenant site the registration happened against, when one is known. */
  siteName: string | null;
}

/**
 * A post-account step (the Dart RegistrationStep): the home SDK owns its
 * UI entirely - auth_sdk sequences it, shows the progress and the skip
 * affordance, and never inspects it.
 */
export interface RegisterStep {
  /** Stable, unique in the config. */
  id: string;
  /** The step's name in the progress line. */
  label?: string;
  /** Whether the runner offers "Skip"; true by default - a step must never trap a fresh account. */
  skippable?: boolean;
  /** The step's component, loaded when reached. */
  load: () => Promise<{ default: ComponentType<RegisterStepProps> }>;
}

export interface RegisterConfig {
  /**
   * Whether register is offered at all; true by default. `false` makes the
   * register page redirect to the login, the same way a tenant host's
   * /register does (app/(auth)/tenant-host.ts TENANT_LOGIN_PATH).
   */
  enabled?: boolean;
  copy?: RegisterCopy;
  /** Extra fields after the account fields; none by default. */
  fields?: RegisterField[];
  /** Post-account steps; none by default. */
  steps?: RegisterStep[];
}

/** The shape of a registered config module. */
export interface RegisterConfigModule {
  default: RegisterConfig | null;
}

export interface RegisterEntry {
  /** Stable, unique across SDKs: "<sdk>-register". */
  id: string;
  load: () => Promise<RegisterConfigModule>;
}

/**
 * The register configs home SDKs registered. Entries between the markers
 * are injected by the installer; ONE marker in this file, as in every
 * registry (the installer anchors after the previous entry for a target
 * file, whichever marker it named). An entry is a single self-contained
 * line with a dynamic import. Do not remove or reformat the marker
 * comments inside the array literal.
 */
export const REGISTER_CONFIGS: RegisterEntry[] = [
  // @rokct-sdk-register-start
  // @rokct-sdk-register-end
];

/** auth_sdk's own register page: offered, the account fields only, the platform's words. */
export const DEFAULT_REGISTER_CONFIG: Readonly<Required<Pick<RegisterConfig, "enabled" | "fields" | "steps">> & { copy: Required<RegisterCopy> }> = {
  enabled: true,
  copy: {
    title: "Create account",
    subtitle: "Sign up to get started",
    cta: "Get started",
    signInPrompt: "Already have an account?",
    signInLabel: "Sign in",
  },
  fields: [],
  steps: [],
};

/** A config with every optional part filled from the default. */
export interface ResolvedRegisterConfig {
  enabled: boolean;
  copy: Required<RegisterCopy>;
  fields: RegisterField[];
  steps: RegisterStep[];
}

/**
 * The registered config laid over the default: a key the home SDK gives
 * replaces the default's, a key it leaves out keeps it. `null` (or nothing
 * registered) is the default itself.
 */
export function resolveRegisterConfig(
  config: RegisterConfig | null | undefined,
): ResolvedRegisterConfig {
  return {
    enabled: config?.enabled ?? DEFAULT_REGISTER_CONFIG.enabled,
    copy: { ...DEFAULT_REGISTER_CONFIG.copy, ...(config?.copy ?? {}) },
    fields: config?.fields ? [...config.fields] : [...DEFAULT_REGISTER_CONFIG.fields],
    steps: config?.steps ? [...config.steps] : [...DEFAULT_REGISTER_CONFIG.steps],
  };
}

/** Whether the register page is offered under this config. */
export function registerOffered(
  config: Pick<RegisterConfig, "enabled"> | null | undefined,
): boolean {
  return config?.enabled ?? DEFAULT_REGISTER_CONFIG.enabled;
}

/**
 * The register config this deployment uses: the FIRST registered entry
 * that loads, resolved over the default; with nothing registered, the
 * default. An entry that fails to load is logged and skipped, so a broken
 * registration degrades to auth_sdk's own page rather than to no page.
 */
export async function loadRegisterConfig(
  entries: RegisterEntry[] = REGISTER_CONFIGS,
): Promise<ResolvedRegisterConfig> {
  for (const entry of entries) {
    try {
      return resolveRegisterConfig((await entry.load()).default);
    } catch (error) {
      console.error(`[auth] failed to load register config "${entry.id}":`, error);
    }
  }
  return resolveRegisterConfig(null);
}

/**
 * The fields of a config without their functions, for handing a server
 * component's answer to a client component as a prop; the client resolves
 * `loadOptions` itself through [loadRegisterConfig].
 */
export function serialisableFields(fields: RegisterField[]): RegisterField[] {
  return fields.map(({ loadOptions: _loadOptions, ...field }) => field);
}
