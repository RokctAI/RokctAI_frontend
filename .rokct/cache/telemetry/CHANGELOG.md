# Changelog

## 1.2.0

* The server actions call the platform through `paasCall` from the
  base kernel (`@/app/services/base/platform-gateway`, base_sdk >= 1.3.0)
  instead of the host shell's `app/lib/paas-gateway.ts` helper: an
  import-path change in 4 files (`app/actions/telemetry/admin/dashboard.ts`,
  `app/actions/telemetry/admin/reports.ts`,
  `app/actions/telemetry/dashboard.ts`,
  `app/actions/telemetry/reports.ts`). The kernel's
  `paasCall` keeps the shell helper's exact semantics (`Unauthorized`
  without a session, `PaaS gateway call failed: <cmd>` on any gateway
  failure; the tenant site and credentials come from the session), so the
  actions' try/catch error handling is unchanged.
* `requires` names `app/services/base/platform-gateway.ts` (installed by
  base_sdk) instead of `app/lib/paas-gateway.ts`. No install, integration
  or template-path changes.

## 1.1.0

* Ships the paas-era reports/analytics surfaces that lived under the
  `RokctAI_frontend` shell as 8 flat templates in one top-level
  `installs` list. The lane ownership
  (WHEN/HOW events leave the browser) is unchanged; base_sdk still owns the
  `TelemetryClient`.
  * Shared: `components/admin/GenericReport.tsx`.
  * Admin surfaces: `app/admin/reports/page.tsx`,
    `app/admin/reports/overview/page.tsx` and the
    `app/actions/telemetry/admin/{dashboard,reports}.ts` server actions.
  * Manager surfaces: `app/manager/reports/page.tsx` and the
    `app/actions/telemetry/{dashboard,reports}.ts` server actions.
* Host paths drop the `paas` segment: `app/paas/admin/X` installs to
  `app/admin/X`, `app/paas/dashboard/X` to `app/manager/X`, and
  `app/actions/paas/[admin/]X` to `app/actions/telemetry/[admin/]X`. Import
  specifiers and route strings were rewritten mechanically to match.
* Templates are flat and installed through one top-level `installs` list;
  there are no `app_type` persona blocks. Admin and manager see similar
  pages and the page code hides what the other role should not see
  (Ray, 2026-09-03).
* `requires` lists the host-shell prerequisites the templates import but
  this SDK does not ship (`app/lib/paas-gateway.ts`, `components/ui/card`,
  `components/ui/table`); `_comment` names the owner of each.

## 1.0.0

* Bootstrap `telemetry_sdk` as the delivery-policy owner of the Next.js
  telemetry lane. Installs nothing: all merge blocks empty by design.
