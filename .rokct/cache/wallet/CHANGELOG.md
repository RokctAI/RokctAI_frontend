## 1.0.0

* First Next.js half of the wallet SDK. Consolidates the wallet pages that
  lived under the frontend shell's `app/paas/` tree into one flat
  `templates/` tree: the admin surfaces (business wallet ledger, customer
  wallets, finance wallet history) and the manager surface (shop wallet
  page with top-up dialog).
* Host paths drop the `paas` segment: `app/paas/admin/X` installs to
  `app/admin/X` and `app/paas/dashboard/X` to `app/manager/X`. Import
  specifiers were rewritten to match.
* Templates are flat and installed through one top-level `installs` list;
  there are no `app_type` persona blocks. Admin and manager see similar
  pages and the page code hides what the other role should not see
  (Ray, 2026-09-03).
* The pages call the finance server actions shipped by the gateways SDK
  (`app/actions/gateways/admin/finance.ts`, `app/actions/gateways/finance.ts`),
  so `requires` lists those as cross-SDK prerequisites alongside the host
  shell's `components/ui/*`, `lib/utils` and the still-unmapped
  `app/actions/paas/admin/customers.ts`; `_comment` names each owner.
