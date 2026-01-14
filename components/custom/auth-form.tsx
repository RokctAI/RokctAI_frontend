import React, { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "@/components/ui/button";
import { PLATFORM_NAME, VOUCHER_OFFSET_Y } from "@/app/config/constants";
import { Ticket, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AuthForm({
  action,
  children,
  defaultEmail = "",
  mode,
  selectedPlan,
  defaultCountry,
  industries = [],
  isServicePlan = false,
  onServicePlanChange = () => { },
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
          Use Voucher
        </button>
      )}

      {mode === "signup" && showVoucher && (
        <div className="flex justify-end -mb-2">
          <button
            type="button"
            onClick={() => setShowVoucher(false)}
            className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-400 flex items-center gap-1 transition-colors"
          >
            Cancel Voucher
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {mode === "signup" && plans && plans.length > 0 && (
          <div className="flex flex-col gap-2 pb-2">
            <Label htmlFor="plan" className="text-zinc-600 font-normal dark:text-zinc-400">Selected Plan</Label>
            <Select name="plan" value={activePlan} onValueChange={setActivePlan}>
              <SelectTrigger id="plan" className="bg-muted text-md md:text-sm border-none">
                <SelectValue placeholder="Select Plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id || p.plan_name} value={p.plan_name}>
                    {p.plan_name} Plan
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
              <Label htmlFor="first_name" className="text-zinc-600 font-normal dark:text-zinc-400">
                First Name
              </Label>
              <Input
                id="first_name"
                name="first_name"
                className="bg-muted text-md md:text-sm border-none"
                type="text"
                placeholder="John"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="last_name" className="text-zinc-600 font-normal dark:text-zinc-400">
                Last Name
              </Label>
              <Input
                id="last_name"
                name="last_name"
                className="bg-muted text-md md:text-sm border-none"
                type="text"
                placeholder="Doe"
                required
              />
            </div>
          </div>
        )}

        {/* Row 2: Email & Industry (for Signup) */}
        <div className={mode === "signup" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-2"}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-zinc-600 font-normal dark:text-zinc-400">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              className="bg-muted text-md md:text-sm border-none"
              type={mode === "signup" ? "email" : "text"}
              placeholder="user@acme.com"
              autoComplete="email" required
              defaultValue={defaultEmail}
            />
          </div>

          {mode === "signup" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="industry" className="text-zinc-600 font-normal dark:text-zinc-400">
                Industry
              </Label>
              <Select name="industry" required>
                <SelectTrigger id="industry" className="bg-muted text-md md:text-sm border-none">
                  <SelectValue placeholder="Select Industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries?.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  )) || (
                      <SelectItem value="Other">Other</SelectItem>
                    )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Row 3: Password & Company Name (for Signup) */}
        <div className={mode === "signup" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-2"}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-zinc-600 font-normal dark:text-zinc-400">
              Password
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
              <Label htmlFor="company_name" className="text-zinc-600 font-normal dark:text-zinc-400">
                Company Name
              </Label>
              <Input
                id="company_name"
                name="company_name"
                className="bg-muted text-md md:text-sm border-none"
                type="text"
                placeholder="Acme Inc."
                required
              />
            </div>
          )}
        </div>

        {/* Row 4: Country & Voucher (Conditional) */}
        {mode === "signup" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="country" className="text-zinc-600 font-normal dark:text-zinc-400">
                Country
              </Label>
              <Input
                id="country"
                name="country"
                className="bg-muted text-md md:text-sm border-none"
                type="text"
                placeholder="United States"
                defaultValue={defaultCountry || ""}
                required
              />
            </div>

            {showVoucher && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-right-1">
                <Label htmlFor="voucher_code" className="text-indigo-600 font-medium dark:text-indigo-400 flex items-center gap-1">
                  <Ticket className="w-3 h-3" />
                  Voucher Code
                </Label>
                <Input
                  id="voucher_code"
                  name="voucher_code"
                  className="bg-muted text-md md:text-sm border-indigo-500/20 border ring-indigo-500/10 focus-visible:ring-indigo-500 shadow-sm"
                  type="text"
                  placeholder="ENTER-CODE"
                  autoFocus
                />
              </div>
            )}
          </div>
        )}


        {mode === "signup" && <input type="hidden" name="plan" value={activePlan} />}

        {mode === "signup" && (
          <>
            {/* Auto-detect if Service Plan, OR if name involves Hosting (Safe Fallback) */}
            {(plans.find(p => p.plan_name === activePlan)?.plan_type === "Service" || activePlan?.toLowerCase().includes("hosting")) && (
              <div className="flex flex-col gap-2 pt-2 animate-in fade-in slide-in-from-top-1">
                <input type="hidden" name="is_service_plan" value="true" />
                <Label htmlFor="domain" className="text-zinc-600 font-normal dark:text-zinc-400 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Domain (Optional)
                </Label>
                <Input
                  id="domain"
                  name="domain"
                  className="bg-muted text-md md:text-sm border-none"
                  type="text"
                  placeholder="example.com"
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
