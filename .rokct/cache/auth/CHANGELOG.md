## 1.7.1

* **`middleware.ts` type-checks again.** 1.7.0 imported `NextRequest` with
  `import type` and then constructed one (`new NextRequest(request, {
  headers })`) on the tenant-host branch: a type-only import is erased at
  runtime, so that branch threw `ReferenceError: NextRequest is not
  defined` the first time a tenant host resolved, and `tsc --noEmit` on a
  composed host failed with five errors (TS1361 on the constructor, TS2345
  / TS2339 around the gate). `NextRequest` is now a value import, and the
  NextAuth gate is typed as the `NextMiddleware` it is called as -
  next-auth 5.0.0-beta.30's `auth` carries no `(NextRequest,
  NextFetchEvent)` overload, so TypeScript had been resolving the call to
  the `Promise<Session | null>` one and reading the pass-through's
  `headers` off a `Session`. Behaviour is otherwise unchanged; no file
  other than `middleware.ts` moves.

## 1.7.0

Requires base_sdk >= 1.20.0 (`app/services/base/tenant-host-control.ts`).

* **The tenant-host switch.** `middleware.ts` asks base_sdk's
  `resolveTenantSiteForRequest` which tenant site, if any, the host a request
  arrived on belongs to - a custom domain a tenant pointed at this
  deployment, resolved at the control site and cached; never a non-public
  host, never the configured site's own host, never thrown. With NOTHING
  resolved the request is handed to NextAuth exactly as before: the
  storefront. With a site: the request goes on with the
  `x-rokct-tenant-site` header set; `/` and `/landing` are REWRITTEN to
  `/login` (the URL stays); `/register` is REDIRECTED to `/login`; every
  other path keeps today's path/role logic with the header. NextAuth's gate
  runs first on every path, so a signed-in user still lands on their
  dashboard from `/`; the switch only reshapes the gate's pass-through
  answers, and its cookies travel on the replacement. The decision is pure
  and tested: `app/(auth)/tenant-host.ts` (`TENANT_LOGIN_PATH`,
  `TENANT_HOME_PATHS`, `TENANT_REGISTER_PATHS`, `tenantHostDecision`,
  `isPassThrough`, `resolveTenantSite`).
* **`/login` is one path with two forms.** `app/(auth)/login/page.tsx` is a
  server switch: with a `site_name` query parameter (it wins) or the
  forwarded header it renders the tenant portal login
  (`components/custom/paas-login.tsx`, which takes the site as a
  `tenantSite` prop when the query names none and posts to
  `https://<site>` and nowhere else); otherwise the platform's own sign-in,
  now `login/login-view.tsx` - the client page this file used to be, moved
  verbatim. The `login` action falls back to the header when the form
  named no site. Unknown hosts never render a portal against the control
  site: without a resolved site there is no portal.
* **The register registry** (Ray, 2026-09-09: "register is not fitting for
  all, what rokct need is not what all needs, any home sdk need to inject
  what it needs, just like dart auth sdk has"). The Dart auth SDK owns the
  register FLOW and nothing product-specific: the home SDK flips
  `AuthRegistrationConfig` flags through a manifest integration at the
  installed shell's `// @auth-registration-config` placeholder, contributes
  post-account steps (`RegistrationStep`: visible, skippable, content)
  through its manifest `registration_steps` list into
  `@generated-registration-steps`, and extends completion at
  `@registration-complete-hook`. Mirrored here as two one-marker,
  single-answer registries in `tenant-link.ts`'s shape:
  * `components/custom/auth/register-registry.ts`
    (`// @rokct-sdk-register-start`; one line,
    `{ id: "<sdk>-register", load: () => import("@/components/custom/auth/<file>") },`):
    a `RegisterConfig` - `enabled` (false: the register page redirects to
    `TENANT_LOGIN_PATH`, the tenant host's own path), `copy` (title,
    subtitle, cta, signInPrompt, signInLabel), `fields` (`RegisterField`:
    name, label, type, placeholder, required, defaultValue, `fromQuery`,
    autoComplete, hint, options, `loadOptions`, span) rendered after the
    account fields by `auth-form.tsx`, and `steps` (`RegisterStep`: id,
    label, skippable, `load` -> a component taking `next`, `skip`, `email`,
    `siteName`) run one after another by `register/register-view.tsx` once
    the account exists. `loadRegisterConfig()` answers the first entry that
    loads, laid over `DEFAULT_REGISTER_CONFIG`.
  * `app/(auth)/register-provision.ts`
    (`// @rokct-sdk-register-provision-start`; one line,
    `{ id: "<sdk>-register-provision", load: () => import("@/app/(auth)/<file>") },`):
    a `RegisterProvisioner` whose `provision(submission)` - email, password,
    firstName, lastName, `values` (every extra field by name), `tenantSite`
    - answers a `RegisterOutcome`: `success` with an optional `signIn`
    (email, password, siteName, extra) and `message`, or `failed` /
    `user_exists` / `invalid_data` with `error`. A separate server-side
    file so no server module is reachable from the client-safe config.
  * With NOTHING registered: auth_sdk's own register page - first name,
    last name, email, password, the platform's words - and the default
    provisioner `app/(auth)/register-provision-default.ts`: the platform's
    guest `api.user.register_user` on the tenant site the request is for
    (the Dart `AuthRepository`'s own sign-up call), then a sign-in. Never
    the control site.
  * **Moved OUT of auth_sdk**, for agent_sdk to inject through the two
    registries in a later release: everything `register()` and
    `auth-form.tsx` carried inline for one product - company and tenant
    provisioning at the control site under a platform administrator's keys
    (`control:provision_service_subscription`,
    `control:provision_new_tenant`, the `adminCredentials` read), the plan
    select and the `?plan=` prefill, the industry catalogue
    (`getIndustries()`, gone from `actions.ts`), the country and currency
    lookup (`get_pricing_metadata`), the voucher and the service-plan
    domain, and the plan-dependent auto-login rule.
    `lib/actions/getSubscriptionPlans.ts` stays installed (other files may
    import it) but nothing in auth_sdk reads it any more.
  * `register/page.tsx` is now a server component that reads the config,
    redirects when register is off, and prefills `fromQuery` fields from
    the URL; the form itself still server-renders as ordinary HTML.
* **The local user row is still written on register.** Moving the
  provisioning out did not move the persistence with it: after ANY
  provisioner succeeds - the default or an injected one - `register()`
  links the account locally through the shell's tenant link exactly where
  1.6.0 did (after provisioning, before the auto-login, unconditionally):
  `app/(auth)/register-link.ts` `linkRegisteredAccount()` writes the email
  and the site (the outcome's `siteName`, else the tenant site the request
  came from) with the 1.6.0 onboarding record through
  `loadTenantLink().linkRegistration()`. That row is the multi-tenancy store
  (Ray, 2026-09-08): it maps a user to the base URL they came from, a later
  login only updates it, and whether anything is written stays the
  per-shell `ROKCT_TENANT_LINK` choice - never a deletion. A provisioner
  never sees the local store.
* `README.md` (new): the host switch, the register contract and a worked
  example. `tests/` (new): `test_manifest.py` in base_sdk's style, and two
  node suites it runs - `tenant-host.test.mts` (a resolved host rewrites
  `/` and `/landing` and redirects `/register`, every other path passes;
  pass-through detection; query-over-header site resolution) and
  `register-registry.test.mts` (nothing injected is the default page;
  an injected config replaces copy, fields and steps; an injected
  provisioner replaces the default; `enabled: false` is not offered),
  and `register-link.test.mts` (the local row is written after a
  provisioner succeeds, for the outcome's site, else the request's).

## 1.6.0

* **Login and register no longer decide for themselves that the answer is a
  local Postgres row.** Three things the credentials flow needs have nothing to
  do with authenticating anybody: which tenant site an email signs in against
  when the form named none, where the keys and site a login produced get
  remembered, and which platform administrator a registration provisions
  under. All three were hardcoded to the drizzle store this SDK installs -
  `db.select()` on `User` inside `Credentials.authorize()`, `db.update()` after
  it, `db.select()` on `GlobalSettings` in `register()` and `getIndustries()`,
  and the insert/update on `User` that register ends with. They now go through
  `app/(auth)/tenant-link.ts`, a one-marker first-wins registry in the shape
  base_sdk's `hero-form.ts` and `plans-query.ts` established: an SDK installs a
  module whose default export is a `TenantLink` and registers it with one line
  at `// @rokct-sdk-tenant-link-start`,
  `{ id: "<sdk>-tenant-link", load: () => import("@/app/(auth)/<file>") },`.
  `loadTenantLink()` answers the first entry that loads.
* **The Postgres path is the DEFAULT and is not going anywhere.** It moved
  verbatim into `app/(auth)/tenant-link-database.ts` - the same queries, in the
  same order, with the same conditions, including the detail that a login only
  ever UPDATEs a row that already exists. With nothing registered and
  `ROKCT_TENANT_LINK` unset that is what answers, so **rokctai_frontend is
  unchanged**: it still looks every login's site up in Postgres, still writes
  the refreshed keys back, still reads its admin keys off `GlobalSettings`, and
  still needs a live database for `db:migrate` before `next build`. The local
  store is the multi-tenancy feature - it maps a user to the base URL they came
  from - and the seam exists so a single-tenant shell can opt out, never so
  this path can be deleted.
* **A single-tenant shell can now be database-free, with one line of its own
  config.** `ROKCT_TENANT_LINK=single-tenant` selects
  `app/(auth)/tenant-link-single.ts`, which imports neither `@/db` nor drizzle
  nor postgres. Both built-ins are reached by dynamic import precisely so that
  selecting one does not evaluate the other. It answers the site from
  base_sdk's kernel resolver - `envBaseUrl()` in
  `app/services/base/tenant-hosts.ts`, the
  `ROKCT_BASE_URL` -> `NEXT_PUBLIC_ROKCT_BASE_URL` -> `NEXT_PUBLIC_FRAPPE_URL`
  chain every other service in the shell already reads, rather than a second
  mechanism of this SDK's own - and makes the two local writes deliberate
  no-ops: `User.siteName` and `User.onboardingData` exist so a deployment with
  many backends can remember which one a user belongs to, and where there is
  exactly one the row would record a constant. The authoritative user record
  lives on the tenant site either way. A host sets the variable the
  compile-time way, through `env` in its own `next.config.mjs`, because that
  file is host-owned and therefore survives a compose - an SDK-installed file
  does not, as `scripts/compose.sh reconcile_tracked_host_files()` documents.
* **Administrator credentials for a database-free register come from the
  deployment, not from the gateway.** `tenant-link-single.ts` reads
  `ROKCT_ADMIN_API_KEY` / `ROKCT_ADMIN_API_SECRET`. Registration is a guest
  call with no session, so an unauthenticated gateway cmd that handed out
  administrator credentials would be a credential oracle open to the internet;
  and the `GlobalSettings` row the default reads is itself only a cache of "an
  administrator signed in here once". Unset means "not initialized" and
  registration stops with exactly the message an empty `GlobalSettings` row
  produces today, rather than calling the control plane unauthenticated.
* **A shell with no database no longer reports a misconfiguration as "invalid
  credentials".** The site lookup sat inside the `try` whose `catch` returns
  `null`, so on a deployment with `POSTGRES_URL` unset every single login
  failed as a rejected password while the real error - the connection - was
  only ever a server log line. With the single-tenant link selected there is no
  connection to fail, and the first thing that can go wrong is the gateway
  login call itself.
* **New requirement: `app/services/base/tenant-hosts.ts`** (base_sdk's kernel
  resolver, for `envBaseUrl()`). Added to the manifest's `requires`, not its
  `installs`: every composed shell already has it, because base_sdk installs
  its whole `src/services` surface there and composes before this SDK.
* `install.py` is unchanged, so the composer's pinned installer digest is
  unchanged.

## 1.5.0

* **`/register` shipped a literally blank page, and this fixes it.** The whole
  page sat inside `<Suspense fallback={null}>` because `RegisterPageInner`
  calls `useSearchParams()` to read `?plan=`. A client component that reads
  `useSearchParams()` makes Next bail its enclosing Suspense boundary out to
  client rendering during static prerendering, so the only thing that reached
  the HTML was that boundary's fallback - and the fallback was `null`. The
  served document for `/register` contained zero `<form>` elements, zero
  `<input>` elements, a `<div hidden></div>` and a
  `BAILOUT_TO_CLIENT_SIDE_RENDERING` template: a blank white page until the JS
  bundle downloaded and executed, and a blank page forever if it did not.
  `useSearchParams()` is now confined to `PlanFromQuery`, a leaf that renders
  `null` and hands the value up, wrapped in its own boundary. The bailout is
  confined with it, so the registration form server-renders as ordinary HTML.
  The page-level boundary is kept but its fallback is now a real card-shaped
  skeleton rather than `null`, so a future hook that bails lands on a
  placeholder instead of blanking the route again.
  `components/custom/auth-form.tsx` gained a one-line
  `useEffect` that syncs `activePlan` when `selectedPlan` arrives after the
  first render - `useState(selectedPlan || "Free")` reads its initial value
  once, so without it the deep link `/register?plan=X` would have silently
  stopped preselecting the plan.
* **The auth screens are theme-token driven, so every shell themes itself.**
  Login and register hardcoded Rokct's indigo/purple: `bg-gradient-to-r
  from-indigo-600 to-purple-600` on both submit buttons, an indigo/purple
  gradient behind the login logo, `text-indigo-600` links, and the
  `border-indigo-500/20 ring-indigo-500/10 focus-visible:ring-indigo-500`
  voucher field in `auth-form.tsx`. A host's `--primary` was already correct
  and already served - it was simply painted over, because a gradient is a
  `background-image` and renders on top of `.bg-primary`'s
  `background-color`. Every one of those is now the token: `bg-primary` /
  `hover:bg-primary/90` / `text-primary-foreground` on the buttons (the
  gradient is gone, not restyled - leaving it would overpaint again),
  `text-primary` on links and the voucher label, `border-primary/20` and
  `focus-visible:ring-ring` on the voucher input. The surrounding chrome moved
  off raw greys onto `bg-background`, `bg-card`, `border-border`,
  `text-foreground` and `text-muted-foreground` for the same reason: the
  hardcoded `bg-gray-50` / `bg-white` / `text-gray-900` card ignored the host's
  own light/dark tokens.
  `components/custom/submit-button.tsx` no longer forces `text-white` on every
  submit button; `components/ui/button.tsx`'s default variant already supplies
  `text-primary-foreground`, and the hardcoded white made a light-primary shell
  unreadable.
  **This is a visible change to rokct.ai as well as to supacharge.app.**
  rokctai_frontend composes auth_sdk too, so its login and register now render
  in its own `--primary` instead of the indigo/purple gradient. That is the
  point of the change - each shell themes itself - but it is not confined to
  one product.
* **New requirement: `components/custom/brand-logo.tsx`.** The login page drew
  an inline Lucide "layers" glyph on an indigo gradient - a mark belonging to
  no product - and the register page had no mark at all. Both now render
  `<BrandLogo width={56} height={56} />`. This invents no mechanism: the
  component is an existing host seam that `rokctai_frontend` and
  `supacharge-web` both already ship with an identical prop signature
  (`width`, `height`, `className`, `variant`, `showBadge`, `isCircle`,
  `priority`), so it is added to the manifest's `requires` rather than to its
  `installs`, and each shell shows its own mark with no branching in the SDK.
* **`/forgot-password` is no longer white-on-white.** The placeholder page set
  `text-white` on a container with no background of its own, so it was legible
  only because every shell happened to render it on a dark body. It is now
  `bg-background text-foreground`, which is what makes it survive a host whose
  light theme is actually reachable - `/login` links straight to it.
* **The "Or continue with" divider is gone from the login card.** It labelled
  an empty list: this form ships no OAuth or social provider buttons, so the
  divider sat directly above the "Create an account" link. Restore it in the
  same commit that adds the first provider button.
* The install surface and `install.py` are untouched - `install.py`'s sha256 is
  unchanged, so the protocol's `supacharge.json` / `rokctapp.json` pins still
  hold. `manifest.json` changes only in `version` and in one added `requires`
  entry; no `installs` entry is added, moved or removed.

## 1.4.1

* **`db/index.ts` no longer needs a database to BUILD.** The module read
  `POSTGRES_URL` and constructed the postgres client at import time, throwing
  `POSTGRES_URL environment variable is not set` from module scope. `next build`
  imports it while collecting page data for the auth handler
  (`app/(auth)/api/auth/[...nextauth]/route.ts` -> `app/(auth)/auth.ts` ->
  `@/db`), so any host composing auth_sdk without `POSTGRES_URL` in its BUILD
  environment died with `Failed to collect page data for
  /api/auth/[...nextauth]` - even though nothing needs a database to compile.
  This took supacharge-web's production deploy red on Vercel, where the
  variable is a runtime value and is not present at build time.
  The connection is now created lazily on first use and memoised, so the client
  is still constructed exactly once per process and pooling is unchanged. The
  exported `db` is a transparent proxy around it: callers keep writing
  `db.select()...` / `db.insert()...` with no change at any call site
  (`app/(auth)/auth.ts`, `app/(auth)/actions.ts`,
  `app/services/control/global_settings.ts`).
  **Runtime behaviour is deliberately identical:** the guard still exists and
  still throws the same `Error` with the same message - on the first query
  instead of on import. There is no default connection string and no silent
  fallback; a request that touches the database with `POSTGRES_URL` unset fails
  exactly as loudly as before. Hosts no longer need to feed the build a
  throwaway connection string to get a green build, which is what was masking
  the missing variable in the first place.
* Auth logic, the install surface and `install.py` are untouched (`install.py`
  sha256 is unchanged, so the protocol's `supacharge.json` / `rokctapp.json`
  pins still hold). The only changed file is
  `auth/nextjs/templates/db/index.ts`.

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
