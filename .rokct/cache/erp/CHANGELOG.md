## 1.0.1

* The HRMS department and designation services sync from the control
  plane again. `app/services/all/hrms/departments.ts` and
  `app/services/all/hrms/designations.ts` called
  `(client as any).call({ method, args })` (two sites each: the
  `frappe.client.get_list` read on the system control client and the
  `frappe.client.insert` write on the tenant client), but frappe-js-sdk's
  `call()` takes no arguments: the object was dropped, nothing was sent,
  and the promise resolved to a `FrappeCall` handle, so `syncGlobal*`
  never found a `message` and silently synced nothing.
  * The control-site reads become `gatewayCall(systemClient,
    "frappe.client.get_list", args)` from `app/lib/gateway-rpc.ts`
    (installed by base_sdk): the command posts on the
    `getSystemControlClient()` client's OWN connection, so routing stays
    on the control site with its admin keys. They are deliberately NOT
    switched to `platformCall` / `paasCall`, which resolve the session's
    TENANT URL and would read the tenant's own departments back.
  * The tenant-side inserts become `BaseService.call("frappe.client.insert",
    { doc })`, the shape every other call in these services already uses;
    `getClient` is no longer imported.
  * `frappe.client.*` cmds are passed verbatim; no `/api/method/<name>` URL
    is built anywhere.
* `requires` names `app/lib/gateway-rpc.ts` (installed by base_sdk) and a
  `_comment` says why.
* `tests/test_gateway_calls.py` (new, stdlib unittest) fails the build if
  an object-argument `.call({...})` / `frappe.call(` / `(x as any).call(`
  pattern reappears anywhere under `templates/`, and ties the top
  CHANGELOG entry to `manifest.json`'s version.

## 1.0.0

* First Next.js half of the erp SDK: the accounting and HRMS surfaces and
  their server actions and services under one flat `templates/` tree,
  installed through one top-level `installs` list.
