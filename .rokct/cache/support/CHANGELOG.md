## 1.1.0

* The server actions call the platform through `paasCall` from the base
  kernel (`@/app/services/base/platform-gateway`, base_sdk >= 1.3.0) instead
  of the host shell's `app/lib/paas-gateway.ts` helper: an import-path
  change in 1 file (`app/actions/support/admin/support.ts`). The kernel's
  `paasCall` keeps the shell helper's exact semantics (`Unauthorized`
  without a session, `PaaS gateway call failed: <cmd>` on any gateway
  failure; the tenant site and credentials come from the session), so the
  actions' try/catch error handling is unchanged.
* `requires` names `app/services/base/platform-gateway.ts` (installed by
  base_sdk) instead of `app/lib/paas-gateway.ts`. No install, integration or
  template-path changes.

## 1.0.0

* First Next.js half of the support SDK. Consolidates the support-ticket
  admin surface that lived under the frontend shell's `app/paas/` tree
  into one flat `templates/` tree (the support tickets page plus the
  admin support server actions).
* Host paths drop the `paas` segment: `app/paas/admin/X` installs to
  `app/admin/X` and `app/actions/paas/admin/X` to
  `app/actions/support/admin/X`. Route strings and import specifiers were
  rewritten to match.
* Templates are flat and installed through one top-level `installs` list;
  there are no `app_type` persona blocks. Admin and manager see similar
  pages and the page code hides what the other role should not see
  (Ray, 2026-09-03).
* `requires` lists the host-shell prerequisites the templates import but
  this SDK does not ship (`components/ui/*`, `app/lib/paas-gateway.ts`);
  `_comment` names the owner of each.
