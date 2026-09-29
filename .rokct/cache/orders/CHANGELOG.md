# Changelog

## 1.1.2

* Admin POS calls real cmds: products from `api.seller_product.get_seller_products`, categories from `api.category.get_categories`, and the sale through `api.order.create_order` with `order_data` holding `shop` / `order_items[].product` + `quantity` (the PosSaleQueue contract). The `api.admin_management.*` POS cmds never existed.

## 1.1.1

* Admin orders list sends `status` directly to `get_all_orders` (the nested `filters` object was dropped).
* Manager order list links to `/manager/orders/<id>` instead of the removed `/dashboard` route.
* Manager POS maps Product `title`/`price` onto the page (no more `item_name` crash or NaN totals); order detail maps `order_items`/`total_price` onto the rendered shape.

## 1.1.0

* The server actions call the platform through `paasCall` from the base
  kernel (`@/app/services/base/platform-gateway`, base_sdk >= 1.3.0) instead
  of the host shell's `app/lib/paas-gateway.ts` helper: an import-path
  change in 6 files (`app/actions/orders/admin/orders.ts`,
  `app/actions/orders/admin/pos.ts`, `app/actions/orders/orders.ts`,
  `app/actions/orders/parcel.ts`, `app/actions/orders/pos.ts`,
  `app/actions/orders/refunds.ts`). The kernel's `paasCall` keeps the shell
  helper's exact semantics (`Unauthorized` without a session, `PaaS gateway
  call failed: <cmd>` on any gateway failure; the tenant site and
  credentials come from the session), so the actions' try/catch error
  handling is unchanged.
* `requires` names `app/services/base/platform-gateway.ts` (installed by
  base_sdk) instead of `app/lib/paas-gateway.ts`. No install, integration or
  template-path changes.

## 1.0.0

* Initial Next.js half. 28 paas-era surfaces consolidated from the RokctAI_frontend shell: 12 admin, 12 manager and 4 common platform-orders files, all as flat templates in one top-level `installs` list. Host paths drop the `paas` segment (`app/paas/admin/*` -> `app/admin/*`, `app/paas/dashboard/*` -> `app/manager/*`, `app/actions/paas/*` -> `app/actions/orders/*`); there are no `app_type` persona blocks: admin and manager see similar pages and the page code hides what the other role should not see (Ray, 2026-09-03).
