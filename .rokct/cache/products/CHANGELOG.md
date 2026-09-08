# Changelog

## 1.2.0

* The server actions call the platform through `paasCall` from the base
  kernel (`@/app/services/base/platform-gateway`, base_sdk >= 1.3.0) instead
  of the host shell's `app/lib/paas-gateway.ts` helper: an import-path
  change in 9 files (`app/actions/products/admin/products.ts`,
  `app/actions/products/brands.ts`, `app/actions/products/categories.ts`,
  `app/actions/products/extras.ts`, `app/actions/products/gallery.ts`,
  `app/actions/products/operations.ts`, `app/actions/products/products.ts`,
  `app/actions/products/receipts.ts`, `app/actions/products/upload.ts`). The
  kernel's `paasCall` keeps the shell helper's exact semantics
  (`Unauthorized` without a session, `PaaS gateway call failed: <cmd>` on
  any gateway failure; the tenant site and credentials come from the
  session), so the actions' try/catch error handling is unchanged.
* `requires` names `app/services/base/platform-gateway.ts` (installed by
  base_sdk) instead of `app/lib/paas-gateway.ts`. No install, integration or
  template-path changes.

## 1.1.0

* Re-pointed the 20 existing templates from the removed `app/paas/*` host paths to `app/admin/*`, `app/manager/*` and `app/actions/products/*`, all as flat templates in one top-level `installs` list; there are no `app_type` persona blocks: admin and manager see similar pages and the page code hides what the other role should not see (Ray, 2026-09-03).
* Added 12 paas-era catalogue surfaces consolidated from the RokctAI_frontend shell: brands, gallery, units, shop categories and the category/product/stock/variation reports (10 admin, 2 manager) plus the brands and gallery actions.
