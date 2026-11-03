# auth_sdk - Next.js half

The NextAuth surface a composed shell authenticates with: the `app/(auth)`
route group (login, register, forgot-password, the `[...nextauth]` handler),
the tenant portal login, the drizzle persistence the credentials flow may
write to, and the host seams it overwrites (`middleware.ts`,
`app/lib/session.ts`, `app/services/control/global_settings.ts`,
`components/custom/session-provider.tsx`). `manifest.json` lists what is
installed and what the host must already have; `CHANGELOG.md` the history.

Requires base_sdk >= 1.20.0.

## The tenant-host switch (1.7.0)

One deployment answers on any number of hosts. A tenant that points its own
domain at the shell (a `custom_domain` on its Company Subscription at the
control site) expects that host to open ITS portal; every other host keeps
the storefront.

`middleware.ts` asks base_sdk's `resolveTenantSiteForRequest(request.headers)`
(`app/services/base/tenant-host-control.ts`) which tenant site the request
host belongs to. base resolves it at the control site's guest
`resolve_site_by_host`, caches the answer, never asks for a non-public host
(localhost, loopback, `.vercel.app`, `.local`, `.internal`), for the
configured `NEXT_PUBLIC_SITE_URL` host or for the control host, and never
throws - unknown means `null`.

| Host resolves to a site | Path              | Middleware does                                   |
| ----------------------- | ----------------- | ------------------------------------------------- |
| no                      | any               | exactly what 1.6.0 did: NextAuth's path/role gate |
| yes                     | `/`, `/landing`   | rewrite to `/login` (URL unchanged), header set   |
| yes                     | `/register`       | redirect to `/login`                              |
| yes                     | anything else     | NextAuth's gate, then pass on with the header set |

The header is `x-rokct-tenant-site: <site>` (base's `TENANT_SITE_HEADER`).
NextAuth's gate runs first on every path, so a signed-in user on a tenant
host still lands on their dashboard from `/`; the switch only reshapes the
gate's pass-through answers. The pure decision lives in
`app/(auth)/tenant-host.ts` (`tenantHostDecision`, `TENANT_LOGIN_PATH`,
`TENANT_HOME_PATHS`, `TENANT_REGISTER_PATHS`, `resolveTenantSite`).

`/login` is one path with two forms. `app/(auth)/login/page.tsx` renders the
tenant portal login (`components/custom/paas-login.tsx`) when a `site_name`
query parameter is present (it wins) or the header was forwarded, and the
platform's own sign-in (`login/login-view.tsx`) otherwise. The portal login
posts to `https://<site>` and nowhere else; the `login` action falls back
to the header when the form named no site. An unknown host never renders a
portal against the control site.

## The register registry (1.7.0)

Ray, 2026-09-09: "register is not fitting for all, what rokct need is not
what all needs, any home sdk need to inject what it needs, just like dart
auth sdk has."

The Dart auth SDK owns the register FLOW and nothing product-specific. Its
home SDK flips `AuthRegistrationConfig` flags through a manifest
`integrations` entry aimed at the installed shell's
`// @auth-registration-config` placeholder, contributes post-account steps
(`RegistrationStep`: visible, skippable, content) through its manifest
`registration_steps` list into the `@generated-registration-steps` block,
and extends completion routing at `@registration-complete-hook`. With
nothing declared the app gets the generic account form.

This half mirrors that with two one-marker, single-answer registries in the
shape of `app/(auth)/tenant-link.ts` and base_sdk's landing registries. The
installer (`sdk_installer_base.py update_integrations()`) injects the home
SDK's line at the marker and skips any other SDK's with `[~]`.

### 1. The config - `components/custom/auth/register-registry.ts`

Marker: `// @rokct-sdk-register-start` / `-end`. One line per SDK:

```ts
{ id: "<sdk>-register", load: () => import("@/components/custom/auth/<file>") },
```

The module's default export is a `RegisterConfig`:

```ts
interface RegisterConfig {
  enabled?: boolean;          // false: the register page redirects to /login
  copy?: {                    // any subset; the rest keeps the platform's words
    title?: string; subtitle?: string; cta?: string;
    signInPrompt?: string; signInLabel?: string;
  };
  fields?: RegisterField[];   // extra fields AFTER first name, last name, email, password
  steps?: RegisterStep[];     // post-account steps, run once the account exists
}

interface RegisterField {
  name: string; label: string;
  type?: "text" | "email" | "password" | "tel" | "url" | "number"
       | "select" | "checkbox" | "hidden";
  placeholder?: string; required?: boolean; defaultValue?: string;
  fromQuery?: string;         // prefill from this query parameter of /register
  autoComplete?: string; hint?: string;
  options?: { value: string; label: string }[];
  loadOptions?: () => Promise<{ value: string; label: string }[]>;
  span?: 1 | 2;               // columns of the two-column grid
}

interface RegisterStep {
  id: string; label?: string; skippable?: boolean;   // skippable: true by default
  load: () => Promise<{ default: ComponentType<RegisterStepProps> }>;
}
interface RegisterStepProps {
  next: () => void; skip: () => void; email: string; siteName: string | null;
}
```

`loadRegisterConfig()` answers the first entry that loads, laid over
`DEFAULT_REGISTER_CONFIG` (offered, no extra fields, no steps, the
platform's words). The module must be client-safe: data and dynamic-import
thunks only, no server imports.

### 2. The provisioner - `app/(auth)/register-provision.ts`

Marker: `// @rokct-sdk-register-provision-start` / `-end`. One line per SDK:

```ts
{ id: "<sdk>-register-provision", load: () => import("@/app/(auth)/<file>") },
```

The module's default export is a `RegisterProvisioner`:

```ts
interface RegisterProvisioner {
  provision(submission: RegisterSubmission): Promise<RegisterOutcome>;
}
interface RegisterSubmission {
  email: string; password: string; firstName: string; lastName: string;
  values: Record<string, string>;   // every extra field by name, hidden ones included
  tenantSite: string | null;        // the form's site_name, else the forwarded header, else null
}
type RegisterOutcome =
  | { status: "success"; siteName?: string | null;
      signIn?: { email: string; password: string; siteName?: string | null;
                 extra?: Record<string, string> } | false;
      message?: string }
  | { status: "failed" | "user_exists" | "invalid_data"; error?: string };
```

`register()` in `app/(auth)/actions.ts` collects the account fields, puts
every other field under `values`, calls the provisioner, and signs the
account in the way `signIn` asks (against the site it names, never
elsewhere). A separate server-side file, so no server module is reachable
from the client-safe config.

With nothing registered the default is `app/(auth)/register-provision-default.ts`:
the platform's guest `api.user.register_user` on the tenant site the request
is for (the tenant host's site, else the deployment's configured backend),
then a sign-in. Nothing is provisioned and the control site is never the
target.

Whichever provisioner answers, the local link is auth's own step and not
the provisioner's: once the outcome is a success, `register()` writes the
local user row (email, the outcome's `siteName` or else the tenant site the
request came from, the onboarding record) through
`loadTenantLink().linkRegistration()` - `app/(auth)/register-link.ts`,
exactly where 1.6.0 wrote it. That row is the multi-tenancy store a later
login reads to find the base URL a user came from; whether a shell writes
it is `tenant-link.ts`'s per-shell choice (`ROKCT_TENANT_LINK`), and a
provisioner never has to know it exists.

### A worked example, in prose

A home SDK whose product sells hosted workspaces wants its register page to
ask for a workspace name and a plan, to prefill the plan from the `?plan=`
link its pricing section emits, to say "Start your workspace" on the button,
and to create the workspace at the control site under the platform
administrator's keys before signing the new owner in.

It installs a config module at `components/custom/auth/<sdk>-register.ts`
whose default export sets `copy.cta` to "Start your workspace", declares a
`workspace_name` text field (required, `span: 2`) and a `plan` select whose
`loadOptions` reads the plan catalogue through the platform gateway with
`fromQuery: "plan"`, and leaves `enabled` and `steps` alone. It registers
that module with one manifest integration line at
`// @rokct-sdk-register-start`.

It installs a provisioner at `app/(auth)/<sdk>-register-provision.ts` whose
`provision()` reads `values.workspace_name` and `values.plan`, obtains the
administrator through `loadTenantLink().adminCredentials()`, calls the
control site's provisioning cmd through `platformCall` with an explicit
`baseUrl` and `Authorization` header, and answers `{ status: "success",
siteName, signIn: { email, password, siteName } }` - or `{ status:
"success", signIn: false, message: "Check your mail" }` when the site is
still being set up. It registers that module with one manifest integration
line at `// @rokct-sdk-register-provision-start`.

A second home SDK whose product has no self-service sign-up at all registers
a config of `{ enabled: false }` and no provisioner: its `/register` sends
visitors to `/login`, the same place a tenant host's `/register` goes.

## Tests

```bash
python3 -m unittest discover -s auth/nextjs/tests -v
```

`tests/test_manifest.py` checks the manifest and the markers, and runs the
three node suites (`node --experimental-strip-types --test`, node 22.6+)
against staged copies of the pure modules: `tenant-host.test.mts`,
`register-registry.test.mts` and `register-link.test.mts`.
