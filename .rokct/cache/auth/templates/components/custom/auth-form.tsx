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
// The credentials form (auth_sdk 1.7.0): the ACCOUNT fields and nothing
// else of its own. Login asks email and password; sign-up asks first name,
// last name, email and password, then whatever extra fields the home SDK
// declared in its register config (components/custom/auth/register-registry.ts
// RegisterField), rendered here in declaration order. Until 1.7.0 the
// sign-up half carried one product's fields inline - a plan, an industry,
// a company, a country, a voucher, a service domain; those are a register
// config's to declare now, and with none declared the form is the generic
// account form the Dart auth SDK shows an app whose home SDK declares
// nothing.

import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import t from "@/app/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  RegisterField,
  RegisterFieldOption,
} from "@/components/custom/auth/register-registry";

const LABEL = "text-zinc-600 font-normal dark:text-zinc-400";
const CONTROL = "bg-muted text-md md:text-sm border-none";

/** One extra field of a register config. */
function ExtraField({
  field,
  value,
}: {
  field: RegisterField;
  /** A prefilled value (from `fromQuery`); the field's own default otherwise. */
  value?: string | null;
}) {
  const [options, setOptions] = useState<RegisterFieldOption[]>(
    field.options ?? [],
  );
  useEffect(() => {
    if (!field.loadOptions) return;
    let live = true;
    field
      .loadOptions()
      .then((loaded) => {
        if (live && Array.isArray(loaded)) setOptions(loaded);
      })
      .catch((error) =>
        console.error(`[auth] options for "${field.name}" failed:`, error),
      );
    return () => {
      live = false;
    };
  }, [field]);

  const initial = value ?? field.defaultValue ?? "";
  const type = field.type ?? "text";
  if (type === "hidden") {
    return <input type="hidden" name={field.name} value={initial} />;
  }
  const span = field.span === 2 ? "md:col-span-2" : "";

  if (type === "checkbox") {
    return (
      <div className={`flex items-center gap-2 ${span}`}>
        <input
          id={field.name}
          name={field.name}
          type="checkbox"
          defaultChecked={initial === "on" || initial === "true"}
          required={field.required}
          className="h-4 w-4"
        />
        <Label htmlFor={field.name} className={LABEL}>
          {field.label}
        </Label>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${span}`}>
      <Label htmlFor={field.name} className={LABEL}>
        {field.label}
      </Label>
      {type === "select" ? (
        <Select name={field.name} required={field.required} defaultValue={initial || undefined}>
          <SelectTrigger id={field.name} className={CONTROL}>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={field.name}
          name={field.name}
          type={type}
          className={CONTROL}
          placeholder={field.placeholder}
          defaultValue={initial}
          required={field.required}
          autoComplete={field.autoComplete}
        />
      )}
      {field.hint && (
        <p className="text-xs text-muted-foreground">{field.hint}</p>
      )}
    </div>
  );
}

export function AuthForm({
  action,
  children,
  defaultEmail = "",
  mode,
  extraFields = [],
  prefilled = {},
}: {
  action: any;
  children: React.ReactNode;
  defaultEmail?: string;
  mode: "login" | "signup";
  /** The home SDK's extra sign-up fields (RegisterConfig.fields); ignored for login. */
  extraFields?: RegisterField[];
  /** Values for extra fields read from the register URL (`fromQuery`), by field name. */
  prefilled?: Record<string, string | null | undefined>;
}) {
  const signup = mode === "signup";
  return (
    <form action={action} className="flex flex-col gap-4 px-0 pt-8 relative">
      <div className="flex flex-col gap-2">
        {signup && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="first_name" className={LABEL}>
                {t("auth.label_first_name")}
              </Label>
              <Input
                id="first_name"
                name="first_name"
                className={CONTROL}
                type="text"
                placeholder={t("auth.ph_first_name")}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="last_name" className={LABEL}>
                {t("auth.label_last_name")}
              </Label>
              <Input
                id="last_name"
                name="last_name"
                className={CONTROL}
                type="text"
                placeholder={t("auth.ph_last_name")}
                autoComplete="family-name"
                required
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className={LABEL}>
            {t("auth.label_email")}
          </Label>
          <Input
            id="email"
            name="email"
            className={CONTROL}
            type={signup ? "email" : "text"}
            placeholder={t("auth.ph_email")}
            autoComplete="email"
            required
            defaultValue={defaultEmail}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className={LABEL}>
            {t("auth.label_password")}
          </Label>
          <Input
            id="password"
            name="password"
            className={CONTROL}
            type="password"
            autoComplete={signup ? "new-password" : "current-password"}
            required
          />
        </div>

        {signup && extraFields.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {extraFields.map((field) => (
              <ExtraField
                key={field.name}
                field={field}
                value={prefilled[field.name]}
              />
            ))}
          </div>
        )}
      </div>

      {children}
    </form>
  );
}
