## 1.4.0

* **The templates type-check under a host that does not set
  `typescript.ignoreBuildErrors`.** RokctAI_frontend masks type errors in
  its `next.config.mjs`; the supacharge-web shell does not, and composing
  auth_sdk 1.3.0 into it left `next build` red on four errors inside files
  this SDK installs (host files were clean):
  * `app/(auth)/actions.ts` - the PaaS-provisioning path inserted a `User`
    row without `id`. `db/schema.ts` declares `User.id` as
    `varchar(255).primaryKey().notNull()` with no default ("Matching Frappe
    User ID (Email)", migration 0001), so the insert was both a TS2769 and
    a runtime NOT NULL violation. The insert now sets `id: email`, the same
    value the column's comment and the rest of the auth flow key users by.
  * `components/custom/paas-login.tsx` - `useActionState(login, undefined)`
    passed `undefined` where `login` takes an `ActionState`, and the failure
    toast read `state.message`, a field `ActionState` does not have
    (TS2769 / TS2339 / TS2554). The hook is now typed
    `useActionState<ActionState, FormData>(login, { status: "idle" })` and
    the toast shows `state.error`, the field `login` actually populates.
  No runtime behaviour changes for a working flow: the `idle` initial state
  renders exactly as `undefined` did (both `useEffect` branches check
  `state?.status`), and the failure toast now shows the server's error text
  instead of `undefined`.
* **New install: `components/custom/session-provider.tsx`** - the
  `"use client"` wrapper around `next-auth/react`'s `SessionProvider`,
  byte-identical to RokctAI_frontend's host copy. base_sdk's
  `components/custom/app-sidebar.tsx` and `components/custom/nav/team-switcher.tsx`
  call `useSession()`, which throws (a 500 on `/manager` and
  `/manager/reports`) unless a `SessionProvider` is mounted above them; in
  RokctAI_frontend that provider is a host file mounted by the host's
  `app/layout.tsx`. It is next-auth's provider, so it ships with the SDK
  that owns next-auth. **Host contract (same pattern as the other three
  seams):** the host's `app/layout.tsx` imports
  `{ SessionProvider } from "@/components/custom/session-provider"` and
  wraps the `<body>` children with it; a shell that must build without
  auth_sdk commits a neutral pass-through copy (`return <>{children}</>`)
  that this install overwrites. Composing into RokctAI_frontend overwrites
  its identical committed copy, so nothing changes there.
* `install.py` is untouched (sha256 `b9b0d415...ae21b`, the digest the
  protocol's `supacharge.json` / `rokctapp.json` pin), and both registries
  reference this SDK at `ref: "main"`, so the fix reaches shells on merge
  without a registry re-pin.

## 1.3.0

* **The last hand-rolled platform calls ride the base kernel's gateway
  client.** `app/(auth)/auth.ts` sends the `api.user.login` cmd through
  `platformCall` from `@/app/services/base/platform-gateway` (base_sdk >=
  1.3.0) with `requireAuth: false` and `session: null` — there is no session
  yet, this is the login — plus an explicit `baseUrl`, so the call never
  reads the request scope; `throwOnError` keeps the raw fetch's outcomes (a
  non-2xx answer or a connection failure both end in `return null`, the
  latter still logged as "PaaS Login connection failed").
  `app/(auth)/actions.ts` sends the two provisioning calls as the
  `control:provision_service_subscription` and
  `control:provision_new_tenant` cmds the control app registers, with the
  admin credentials as an explicit `Authorization` header and a 60s timeout
  (the raw fetch had none; provisioning runs well past the client's 10s
  default). A non-2xx answer maps to the same "Service/Tenant Provisioning
  failed" result as before; the response body's `message`, which Frappe only
  sets on success anyway, is no longer read for the error text.
* `get_pricing_metadata` stays on its per-method URL: the control site
  registers no `control:` gateway cmd for it, so it cannot ride the gateway
  yet (noted inline). The session-seam comment in `app/lib/session.ts` now
  names the kernel's `app/services/base/session.ts` reader instead of the
  retired shell helper `app/lib/paas-gateway.ts`. No install, integration,
  requirement or seam changes; `requires` already named
  `app/services/base/platform-gateway.ts`.

## 1.2.0

* **Drop `app/(chat)/page.tsx` from installs; the root route is owned by
  agent_sdk (owner ruling 2026-09-03).** Both auth_sdk and agent_sdk
  installed the same file, so the last SDK composed decided what "/"
  rendered. The template `templates/app/(chat)/page.tsx` is deleted and
  its install entry removed; agent_sdk's installer copies the whole
  `app/(chat)` group (including `page.tsx`), so the route now has exactly
  one owner. No other install, integration, requirement or seam changes.

## 1.1.0

* **The auth templates ride the universal platform gateway instead of
  per-method URLs.** Ports RokctAI_frontend commit `b752351` ("ride
  remaining non-paas per-method calls on the platform gateway", #105) into
  the three templates it touched, so the gateway conversion survives the
  removal of the frontend's own copies of these files:
  * `app/(auth)/actions.ts` - `refreshTokens` posts
    `platformCall("api.auth.refresh", { refresh_token })` (the prefix-free
    auth manifest key) instead of `/api/method/rcore.api.auth.refresh`;
    `getIndustries` rides `platformCall("frappe.client.get_list", ...)`
    with the admin `Authorization` header instead of the per-method URL.
  * `app/(auth)/auth.ts` - the post-login subscription lookup calls
    `platformCall("control:get_my_subscription")` (GET, cookie-authenticated)
    instead of `/api/method/control.control.api.subscription.get_my_subscription`.
  * `lib/actions/getSubscriptionPlans.ts` - fetches
    `platformCall("control:get_subscription_plans", { category })` with
    `cache: "no-store"` instead of the `/api/v1/method/...` URL, and
    validates `{ message }` through the existing zod schema.
* The seed-time fixes carried since 1.0.0 (the `getSubscriptionPlans` and
  `PLATFORM_NAME` imports, the Suspense boundary around `useSearchParams`
  on `/register`) are kept. The deliveryplatform-specific behaviour
  (always-paas login, `/paas/dashboard` landing, trimmed `Message` type,
  `GlobalSettingsRecord` seam type) is unchanged.

## 1.0.0

* Initial nextjs half of auth_sdk (deliveryplatform wave): the app/(auth)
  route group, PaaSLogin form, drizzle/Postgres persistence and the three
  host seams (middleware, session, global settings).
