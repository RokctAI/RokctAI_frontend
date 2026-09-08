## 1.1.0

* The server actions call the platform through `paasCall` from the base
  kernel (`@/app/services/base/platform-gateway`, base_sdk >= 1.3.0) instead
  of the host shell's `app/lib/paas-gateway.ts` helper: an import-path
  change in 3 files (`app/actions/gateways/admin/finance.ts`,
  `app/actions/gateways/admin/transactions.ts`,
  `app/actions/gateways/finance.ts`). The kernel's `paasCall` keeps the
  shell helper's exact semantics (`Unauthorized` without a session, `PaaS
  gateway call failed: <cmd>` on any gateway failure; the tenant site and
  credentials come from the session), so the actions' try/catch error
  handling is unchanged.
* `requires` names `app/services/base/platform-gateway.ts` (installed by
  base_sdk) instead of `app/lib/paas-gateway.ts`. No install, integration or
  template-path changes.

## 1.0.0

* First Next.js half of the gateways SDK. Consolidates the payment
  surfaces that lived under the frontend shell's `app/paas/` tree into
  one flat `templates/` tree: the admin surfaces (payment payloads, seller
  payments, payouts and payout requests, sales report, subscriptions
  ledger, transactions, payment settings page, plus the admin finance and
  transactions server actions) and the manager surfaces (shop payouts and
  transactions pages plus the shop finance server actions).
* Host paths drop the `paas` segment: `app/paas/admin/X` installs to
  `app/admin/X`, `app/paas/dashboard/X` to `app/manager/X`, and
  `app/actions/paas/[admin/]X` to `app/actions/gateways/[admin/]X`. Route
  strings and import specifiers were rewritten to match.
* Templates are flat and installed through one top-level `installs` list;
  there are no `app_type` persona blocks. Admin and manager see similar
  pages and the page code hides what the other role should not see
  (Ray, 2026-09-03).
* `requires` lists the host-shell prerequisites the templates import but
  this SDK does not ship (`components/ui/*`, `app/lib/*`, `lib/utils`) and
  the still-unmapped `app/actions/paas/admin/{customers,settings}.ts`;
  `_comment` names the owner of each.
