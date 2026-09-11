# Changelog

## 1.1.1

* The three `frappe.client.*` reads and writes that still went through the
  frappe-js-sdk client (`getPaaSClient()` + `frappe.call({ method, args })`)
  go through the base kernel's `paasCall`
  (`@/app/services/base/platform-gateway`) instead: `getShops` in
  `app/actions/merchants/shop.ts` (`frappe.client.get_list` on Shop),
  `getStaffByRole` in `app/actions/merchants/staff.ts`
  (`frappe.client.get_list` on User, behind `getWaiters` / `getCooks` /
  `getDeliveryMen`) and `updateInviteStatus` in
  `app/actions/merchants/invites.ts` (`frappe.client.set_value` on
  Invitation). frappe-js-sdk's `call()` takes no arguments, so
  `frappe.call({...})` sent nothing and resolved to a `FrappeCall` object:
  the shops list, the three staff lists and the invite status update were
  silently empty no-ops. The cmds stay verbatim (`frappe.client.get_list`,
  `frappe.client.set_value`), resolved server-side by the tenant gateway
  like every other dotted cmd; the former `args` object is the gateway
  payload unchanged, and `paasCall` hands back the unwrapped `message`, so
  each consumer's result handling (a list for the pages, the thrown error
  for the invite update) is unchanged.
* `requires` drops `app/lib/client.ts`: no merchants template imports the
  frappe-js-sdk client any more; `app/services/base/platform-gateway.ts`
  (installed by base_sdk) was already required. No install, integration or
  template-path changes.
* Tests: `tests/test_gateway_calls.py` (stdlib `unittest`; run from the
  repository root with `python3 -m unittest discover -s
  merchants/nextjs/tests -v`) walks every `.ts`/`.tsx` template and fails
  on any object-argument `.call({`, `frappe.call(` or `as any).call(`
  pattern and on any dotted `/api/method/<name>` URL, and asserts the three
  converted sites call `paasCall("frappe.client.…")` with no
  `getPaaSClient` left behind.

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
