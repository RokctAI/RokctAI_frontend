/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import React, { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "@/components/ui/button";
import { PLATFORM_NAME, VOUCHER_OFFSET_Y } from "@/app/config/constants";
import { Ticket, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import t from "@/app/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AuthForm({
  action,
  children,
  defaultEmail = "",
  mode,
  selectedPlan,
  defaultCountry,
  industries = [],
  isServicePlan = false,
  onServicePlanChange = () => {},
  plans = [],
}: {
  action: any;
  children: React.ReactNode;
  defaultEmail?: string;
  mode: "login" | "signup";
  selectedPlan?: string | null;
  defaultCountry?: string | null;
  industries?: string[];
  isServicePlan?: boolean;
  onServicePlanChange?: (checked: boolean) => void;
  plans?: any[];
}) {
  const [showVoucher, setShowVoucher] = useState(false);
  const [activePlan, setActivePlan] = useState(selectedPlan || "Free");

  return (
    <form action={action} className="flex flex-col gap-4 px-0 pt-8 relative">
      {mode === "signup" && !showVoucher && (
        <button
          type="button"
          onClick={() => setShowVoucher(true)}
          className={`absolute top-0 right-0 -mt-8 -mr-8 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 text-[10px] font-bold uppercase tracking-wider rounded-tr-md transition-colors flex items-center z-10`}
        >
          {t("auth.use_voucher")}
        </button>
      )}

      {mode === "signup" && showVoucher && (
        <div className="flex justify-end -mb-2">
          <button
            type="button"
            onClick={() => setShowVoucher(false)}
            className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-400 flex items-center gap-1 transition-colors"
          >
            {t("auth.cancel_voucher")}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {mode === "signup" && plans && plans.length > 0 && (
          <div className="flex flex-col gap-2 pb-2">
            <Label
              htmlFor="plan"
              className="text-zinc-600 font-normal dark:text-zinc-400"
            >
              {t("auth.selected_plan")}
            </Label>
            <Select
              name="plan"
              value={activePlan}
              onValueChange={setActivePlan}
            >
              <SelectTrigger
                id="plan"
                className="bg-muted text-md md:text-sm border-none"
              >
                <SelectValue placeholder={t("auth.ph_select_plan")} />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id || p.plan_name} value={p.plan_name}>
                    {t("auth.plan_suffix", { plan: p.plan_name })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {/* Row 1: Names (Signup Only) */}
        {mode === "signup" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="first_name"
                className="text-zinc-600 font-normal dark:text-zinc-400"
              >
                {t("auth.label_first_name")}
              </Label>
              <Input
                id="first_name"
                name="first_name"
                className="bg-muted text-md md:text-sm border-none"
                type="text"
                placeholder={t("auth.ph_first_name")}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="last_name"
                className="text-zinc-600 font-normal dark:text-zinc-400"
              >
                {t("auth.label_last_name")}
              </Label>
              <Input
                id="last_name"
                name="last_name"
                className="bg-muted text-md md:text-sm border-none"
                type="text"
                placeholder={t("auth.ph_last_name")}
                required
              />
            </div>
          </div>
        )}

        {/* Row 2: Email & Industry (for Signup) */}
        <div
          className={
            mode === "signup"
              ? "grid grid-cols-1 md:grid-cols-2 gap-4"
              : "flex flex-col gap-2"
          }
        >
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="email"
              className="text-zinc-600 font-normal dark:text-zinc-400"
            >
              {t("auth.label_email")}
            </Label>
            <Input
              id="email"
              name="email"
              className="bg-muted text-md md:text-sm border-none"
              type={mode === "signup" ? "email" : "text"}
              placeholder={t("auth.ph_email")}
              autoComplete="email"
              required
              defaultValue={defaultEmail}
            />
          </div>

          {mode === "signup" && (
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="industry"
                className="text-zinc-600 font-normal dark:text-zinc-400"
              >
                {t("auth.label_industry")}
              </Label>
              <Select name="industry" required>
                <SelectTrigger
                  id="industry"
                  className="bg-muted text-md md:text-sm border-none"
                >
                  <SelectValue placeholder={t("auth.ph_select_industry")} />
                </SelectTrigger>
                <SelectContent>
                  {industries?.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  )) || (
                    <SelectItem value="Other">
                      {t("auth.industry_other")}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Row 3: Password & Company Name (for Signup) */}
        <div
          className={
            mode === "signup"
              ? "grid grid-cols-1 md:grid-cols-2 gap-4"
              : "flex flex-col gap-2"
          }
        >
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="password"
              className="text-zinc-600 font-normal dark:text-zinc-400"
            >
              {t("auth.label_password")}
            </Label>
            <Input
              id="password"
              name="password"
              className="bg-muted text-md md:text-sm border-none"
              type="password"
              required
            />
          </div>

          {mode === "signup" && (
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="company_name"
                className="text-zinc-600 font-normal dark:text-zinc-400"
              >
                {t("auth.label_company_name")}
              </Label>
              <Input
                id="company_name"
                name="company_name"
                className="bg-muted text-md md:text-sm border-none"
                type="text"
                placeholder={t("auth.ph_company_name")}
                required
              />
            </div>
          )}
        </div>

        {/* Row 4: Country & Voucher (Conditional) */}
        {mode === "signup" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="country"
                className="text-zinc-600 font-normal dark:text-zinc-400"
              >
                {t("auth.label_country")}
              </Label>
              <Input
                id="country"
                name="country"
                className="bg-muted text-md md:text-sm border-none"
                type="text"
                placeholder={t("auth.ph_country")}
                defaultValue={defaultCountry || ""}
                required
              />
            </div>

            {showVoucher && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-right-1">
                <Label
                  htmlFor="voucher_code"
                  className="text-indigo-600 font-medium dark:text-indigo-400 flex items-center gap-1"
                >
                  <Ticket className="w-3 h-3" />
                  {t("auth.label_voucher_code")}
                </Label>
                <Input
                  id="voucher_code"
                  name="voucher_code"
                  className="bg-muted text-md md:text-sm border-indigo-500/20 border ring-indigo-500/10 focus-visible:ring-indigo-500 shadow-sm"
                  type="text"
                  placeholder={t("auth.ph_voucher_code")}
                  autoFocus
                />
              </div>
            )}
          </div>
        )}

        {mode === "signup" && (
          <input type="hidden" name="plan" value={activePlan} />
        )}

        {mode === "signup" && (
          <>
            {/* Auto-detect if Service Plan, OR if name involves Hosting (Safe Fallback) */}
            {(plans.find((p) => p.plan_name === activePlan)?.plan_type ===
              "Service" ||
              activePlan?.toLowerCase().includes("hosting")) && (
              <div className="flex flex-col gap-2 pt-2 animate-in fade-in slide-in-from-top-1">
                <input type="hidden" name="is_service_plan" value="true" />
                <Label
                  htmlFor="domain"
                  className="text-zinc-600 font-normal dark:text-zinc-400 flex items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  {t("auth.label_domain")}
                </Label>
                <Input
                  id="domain"
                  name="domain"
                  className="bg-muted text-md md:text-sm border-none"
                  type="text"
                  placeholder={t("auth.ph_domain")}
                />
              </div>
            )}
          </>
        )}
      </div>

      {children}
    </form>
  );
}
