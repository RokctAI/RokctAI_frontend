## 1.0.4

* The CRM record actions and the contact service call the scoped
  `api.crm.records.*` gateway cmds instead of the generic `frappe.client.*`
  RPCs: `call_logs.ts`, `notes.ts`, `tasks.ts` (`get_list`, `get_count`),
  `crud.ts` (`set_value` for edits, `insert_doc` for creates), `meta.ts`
  (`get_meta`) and `services/all/crm/contacts.ts` (`get_list`, `get_count`,
  `get_doc`). `tasks.ts` no longer uses the untyped `client.get_list`.
  Counts are a plain number in `message`.
* Needs the crm frappe app with `api.crm.records.get_count` and
  `api.crm.records.get_meta`. Contacts are writable through these cmds.
* `services/all/crm/organizations.ts`, `support.ts`, `leads.ts` and
  `deals.ts` also move onto `api.crm.records.*`, using the new
  `get_value` (deal owner card fields from User) and `delete_doc` cmds.
* Every doctype with a create or edit form is writable, Prospect and
  Contract included (Ray approved 2026-10-03), each write gated by
  `has_permission` for the caller's role.

## 1.0.3

* fix(icons): templates use `@remixicon/react` (`Ri*Line`) instead of `lucide-react`; the manifest deps swap `lucide-react` for `@remixicon/react` ^4.6.0.

## 1.0.2

* fix(support, call logs): list queries select real columns: Issue sla_resolution_date, Warranty Claim complaint_date/complaint, Call Log type (no title).

## 1.0.1

* The server actions under `app/actions/handson/all/crm/` that called the
  frappe-js-sdk client with an object argument (`(client as any).call({
  method, args })`) now go through `gatewayCall(client, cmd, payload)`
  from `@/app/lib/gateway-rpc`. frappe-js-sdk's `call()` takes no
  arguments: it returned a `FrappeCall` helper and sent nothing, so every
  one of these surfaces resolved silently empty. 9 sites in 6 files:
  `call_logs.ts` (`frappe.client.get_list`, `frappe.client.get_count`),
  `crud.ts` (`frappe.client.save`, `frappe.client.insert`),
  `dashboard.ts` (`api.crm.dashboard.get_dashboard`), `meta.ts`
  (`frappe.client.get_meta`), `notes.ts` (`frappe.client.get_list`,
  `frappe.client.get_count`), `tasks.ts` (`frappe.client.get_value`).
  Every `frappe.client.*` cmd is kept verbatim; no dotted
  `/api/method/<name>` URL is introduced.
* `dashboard.ts` no longer hand-wraps `{cmd, payload}` around
  `PLATFORM_GATEWAY_METHOD`: `gatewayCall` carries the gateway envelope
  itself, so the action is one call with cmd
  `api.crm.dashboard.get_dashboard` (the prefix-free alias registered in
  `crm/frappe/manifest.json`). The `PLATFORM_GATEWAY_METHOD` import is gone.
* `call_logs.ts` and `notes.ts` read the list and the count from the
  Frappe `message` envelope `gatewayCall` answers (`logs?.message`,
  `countRes?.message`); the other consumers already read `.message`.
* `requires` names `app/lib/gateway-rpc.ts` (installed by base_sdk)
  beside `app/lib/client.ts`. No install, integration or template-path
  changes.
* Tests: NEW `tests/test_gateway_calls.py` (stdlib `unittest`, run with
  `python3 -m unittest discover -s crm/nextjs/tests -v`) asserts no
  object-argument `.call({` / `frappe.call(` / `as any).call(` site
  remains under `templates/`, every `gatewayCall` names its cmd as a
  positional string literal with the import present, no
  `/api/method/` URL appears, and the manifest pins 1.0.1 with the
  `gateway-rpc.ts` prerequisite.

## 1.0.0

* First Next.js half of the CRM SDK: the `handson/all/crm` pages, server
  actions, services and components, installed through one flat
  `installs` list.
