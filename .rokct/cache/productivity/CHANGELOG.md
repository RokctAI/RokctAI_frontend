## 1.0.1

* The server actions under `app/actions/handson/all/` that called the
  frappe-js-sdk client with an object argument (`client.call({ method,
  args })` / `(client as any).call({ ... })`) now go through
  `gatewayCall(client, cmd, payload)` from `@/app/lib/gateway-rpc`, the
  shape the SDK's `app/actions/ai/*.ts` actions already use. frappe-js-sdk's
  `call()` takes no arguments: it returned a `FrappeCall` helper and sent
  nothing, so every one of these surfaces resolved silently empty. 8 sites
  in 4 files: `projects/me/tasks.ts` (`frappe.client.get_list`),
  `projects/me/timesheets.ts` (`frappe.client.get_list`,
  `frappe.client.insert`), `workspace/dashboard.ts`
  (`frappe.client.get_list`, `frappe.client.insert`), `workspace/events.ts`
  (`frappe.client.insert`, `frappe.client.get_list`,
  `frappe.client.delete`). Every `frappe.client.*` cmd is kept verbatim;
  no dotted `/api/method/<name>` URL is introduced. The consumers already
  read `response?.message`, which `gatewayCall` answers, so nothing else
  in those files changes.
* `requires` already named `app/lib/gateway-rpc.ts`. No install,
  integration or template-path changes.
* Tests: NEW `tests/test_gateway_calls.py` (stdlib `unittest`, run with
  `python3 -m unittest discover -s productivity/nextjs/tests -v`) asserts
  no object-argument `.call({` / `frappe.call(` / `as any).call(` site
  remains under `templates/`, every `gatewayCall` names its cmd as a
  positional string literal with the import present, no `/api/method/`
  URL appears, and the manifest pins 1.0.1 with the `gateway-rpc.ts`
  prerequisite.

## 1.0.0

* First Next.js half of the productivity SDK: the `handson/all/projects`
  and `handson/all/workspace` pages, server actions, AI actions, services
  and components, installed through one flat `installs` list.
