# Changelog

## 1.1.1

* The one `frappe.client.*` read that still went through the frappe-js-sdk
  client (`getPaaSClient()` + `frappe.call({ method, args })`) goes through
  the base kernel's `paasCall` (`@/app/services/base/platform-gateway`)
  instead: `getEmailSubscribers` in
  `app/actions/promotions/admin/marketing.ts` (`frappe.client.get_list` on
  Email Subscription, behind the admin marketing subscribers page).
  frappe-js-sdk's `call()` takes no arguments, so `frappe.call({...})` sent
  nothing and resolved to a `FrappeCall` object: the subscribers list was
  silently empty. The cmd stays verbatim (`frappe.client.get_list`),
  resolved server-side by the tenant gateway like every other dotted cmd;
  the former `args` object is the gateway payload unchanged, and `paasCall`
  hands back the unwrapped `message`, so the page's `setSubscribers(data)`
  is unchanged.
* `requires` drops `app/lib/client.ts`: no promotions template imports the
  frappe-js-sdk client any more; `app/services/base/platform-gateway.ts`
  (installed by base_sdk) was already required. No install, integration or
  template-path changes.
* Tests: `tests/test_gateway_calls.py` (stdlib `unittest`; run from the
  repository root with `python3 -m unittest discover -s
  promotions/nextjs/tests -v`) walks every `.ts`/`.tsx` template and fails
  on any object-argument `.call({`, `frappe.call(` or `as any).call(`
  pattern and on any dotted `/api/method/<name>` URL, and asserts the
  converted site calls `paasCall("frappe.client.…")` with no
  `getPaaSClient` left behind.

## 1.1.0

* The server actions call the platform through `paasCall` from the base
  kernel (`@/app/services/base/platform-gateway`, base_sdk >= 1.3.0) instead
  of the host shell's `app/lib/paas-gateway.ts` helper: an import-path
  change in 3 files (`app/actions/promotions/admin/marketing.ts`,
  `app/actions/promotions/marketing.ts`,
  `app/actions/promotions/stories.ts`). The kernel's `paasCall` keeps the
  shell helper's exact semantics (`Unauthorized` without a session, `PaaS
  gateway call failed: <cmd>` on any gateway failure; the tenant site and
  credentials come from the session), so the actions' try/catch error
  handling is unchanged.
* `requires` names `app/services/base/platform-gateway.ts` (installed by
  base_sdk) instead of `app/lib/paas-gateway.ts`. No install, integration or
  template-path changes.

## 1.0.0

* Initial Next.js half. 11 paas-era surfaces consolidated from the RokctAI_frontend shell: 6 admin (banners, stories, ads, subscribers, admin marketing actions) and 5 manager (ads, stories, coupons, marketing and stories actions), all as flat templates in one top-level `installs` list. Host paths drop the `paas` segment; there are no `app_type` persona blocks: admin and manager see similar pages and the page code hides what the other role should not see (Ray, 2026-09-03).
