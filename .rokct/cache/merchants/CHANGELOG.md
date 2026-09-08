# Changelog

## 1.1.0

* The server actions call the platform through `paasCall` from the base
  kernel (`@/app/services/base/platform-gateway`, base_sdk >= 1.3.0) instead
  of the host shell's `app/lib/paas-gateway.ts` helper: an import-path
  change in 7 files (`app/actions/merchants/admin/shops.ts`,
  `app/actions/merchants/branches.ts`, `app/actions/merchants/business.ts`,
  `app/actions/merchants/invites.ts`, `app/actions/merchants/shop.ts`,
  `app/actions/merchants/staff.ts`, `app/actions/merchants/working-
  hours.ts`). The kernel's `paasCall` keeps the shell helper's exact
  semantics (`Unauthorized` without a session, `PaaS gateway call failed:
  <cmd>` on any gateway failure; the tenant site and credentials come from
  the session), so the actions' try/catch error handling is unchanged.
* `requires` names `app/services/base/platform-gateway.ts` (installed by
  base_sdk) instead of `app/lib/paas-gateway.ts`. No install, integration or
  template-path changes.

## 1.0.0

* Initial Next.js half. 18 paas-era surfaces consolidated from the RokctAI_frontend shell: 5 admin and 13 manager (including the merchant sidebar nav), all as flat templates in one top-level `installs` list. Host paths drop the `paas` segment (`app/paas/admin/*` -> `app/admin/*`, `app/paas/dashboard/*` -> `app/manager/*`, `app/actions/paas/*` -> `app/actions/merchants/*`); there are no `app_type` persona blocks: admin and manager see similar pages and the page code hides what the other role should not see (Ray, 2026-09-03).
